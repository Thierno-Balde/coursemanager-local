import { AppData, Course, CourseItem, Resource, ResourceCategory, ResourceFormat, ResourceKind } from '../types';
import { getResourcesDir } from './paths';

type LegacyResource = {
  label: string;
  type: string;
  url: string;
  description?: string;
};

type LegacyCourseItem = {
  id: string;
  title: string;
  description?: string;
  main?: LegacyResource;
  pdfs?: LegacyResource[];
  videos?: LegacyResource[];
  extras?: LegacyResource[];
  resources?: Resource[]; // already new model
};

type LegacyCourse = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  items: LegacyCourseItem[];
};

const categoryKeys: ResourceCategory[] = ['main', 'pdfs', 'videos', 'extras'];

function guessFormat(typeOrUrl?: string): ResourceFormat | string {
  if (!typeOrUrl) return 'other';
  const lower = typeOrUrl.toLowerCase();
  if (['pdf'].includes(lower)) return 'pdf';
  if (['ppt', 'pptx'].includes(lower)) return 'ppt';
  if (['mp4', 'mkv', 'avi', 'mov'].includes(lower)) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lower)) return 'image';
  if (['zip', 'rar', '7z'].includes(lower)) return 'zip';
  if (lower.startsWith('http')) return 'link';
  return lower as ResourceFormat;
}

function inferKind(urlOrPath?: string): ResourceKind {
  if (!urlOrPath) return 'link';
  return urlOrPath.startsWith('http') ? 'link' : 'file';
}

function createResource(
  legacy: LegacyResource,
  category: ResourceCategory,
  seedIndex: number
): Resource {
  const format = guessFormat(legacy.type || legacy.url.split('.').pop());
  const kind = inferKind(legacy.url);
  const isFile = kind === 'file' && !legacy.url.startsWith('http');

  return {
    id: `res-${category}-${seedIndex}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`,
    label: legacy.label || 'Ressource',
    kind,
    category,
    format,
    path: isFile ? resolveRelativeIfNeeded(legacy.url) : undefined,
    url: legacy.url.startsWith('http') ? legacy.url : undefined,
    createdAt: new Date().toISOString(),
  };
}

function resolveRelativeIfNeeded(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  const resourcesDir = getResourcesDir();
  if (!resourcesDir) return value;
  return `${resourcesDir}/${value.replace(/^[/\\\\]+/, '')}`;
}

function migrateItem(item: LegacyCourseItem, courseIndex: number, itemIndex: number): CourseItem {
  // Already new shape
  if (Array.isArray(item.resources)) {
    return item as CourseItem;
  }

  const resources: Resource[] = [];
  let seedIndex = 0;

  // main
  if (item.main) {
    resources.push(createResource(item.main, 'main', seedIndex++));
  }
  // categories arrays
  (['pdfs', 'videos', 'extras'] as const).forEach(category => {
    const list = item[category] || [];
    list.forEach(res => {
      resources.push(createResource(res, category, seedIndex++));
    });
  });

  return {
    id: item.id || `module-${courseIndex}-${itemIndex}`,
    title: item.title || `Module ${itemIndex + 1}`,
    description: item.description,
    resources,
  };
}

function migrateCourse(course: LegacyCourse, courseIndex: number): Course {
  const items = (course.items || []).map((item, idx) => migrateItem(item, courseIndex, idx));
  return {
    id: course.id || `course-${courseIndex}`,
    name: course.name || `Cours ${courseIndex + 1}`,
    description: course.description || '',
    icon: course.icon,
    items,
  };
}

export function migrateData(data: any): AppData {
  if (!data || !Array.isArray(data.courses)) {
    return { courses: [] };
  }

  // Quick check: already migrated if items[0].resources exists
  const firstCourse = data.courses[0];
  const firstItem = firstCourse?.items?.[0];
  if (firstItem && Array.isArray(firstItem.resources)) {
    return data as AppData;
  }

  const courses = (data.courses as LegacyCourse[]).map((course, idx) => migrateCourse(course, idx));
  return { courses };
}
