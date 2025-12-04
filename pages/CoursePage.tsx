import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
// Removed Lucide icons and ResourceBadge as per new UI design and Material Symbols usage
// import { ResourceBadge } from '../components/ResourceBadge';
// import { ArrowLeft, BookOpen, Download, FileText, MonitorPlay, Layers, Plus, X, FilePlus, PlusCircle, Link as LinkIcon, Trash2, FolderPlus } from 'lucide-react';
import { CourseItem, Resource, ResourceCategory, ResourceKind } from '../types';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses } = useStore(); // Removed addModule, addResource, deleteResource, deleteModule as they are now admin functions

  const initialCourse = courses.find(c => c.id === courseId);
  const items = initialCourse?.items || [];

  // All state and handlers related to modals for adding modules/resources are removed from this component.
  // Functionalities like handleDeleteModule, openResource, etc. are implicitly removed or will be re-implemented in Admin views.


  if (!initialCourse) {
    return (
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-4xl flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center gap-4 text-primary">
                <div className="size-6">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-[#0d141b] dark:text-slate-50">Formation App</h2>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined !text-xl">arrow_back</span>
                <span className="truncate">Retour aux formations</span>
              </button>
            </header>
            <main className="flex flex-col gap-8 p-6">
              <div className="flex flex-wrap justify-between gap-3">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d141b] dark:text-slate-50 min-w-72">Cours introuvable</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400">Le cours demandé n'existe pas ou a été déplacé.</p>
              <Link
                to="/"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-fit"
              >
                Retour au portail
              </Link>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Helper to map icon names from types to Material Symbols, or use a default
  const getMaterialSymbol = (iconName?: string) => {
    switch (iconName) {
      case 'Folder': return 'folder';
      case 'BookOpen': return 'book';
      case 'Zap': return 'bolt';
      case 'Cpu': return 'memory';
      case 'Code': return 'code';
      case 'Database': return 'database';
      case 'Globe': return 'language';
      case 'PenTool': return 'design_services';
      case 'Activity': return 'trending_up';
      case 'Layers': return 'layers';
      case 'Box': return 'box';
      case 'Terminal': return 'terminal';
      default: return 'folder_open'; // Default icon if not found
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-4xl flex-col">
            {/* TopNavBar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center gap-4 text-primary">
                <div className="size-6">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-[#0d141b] dark:text-slate-50">Formation App</h2>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined !text-xl">arrow_back</span>
                <span className="truncate">Retour aux formations</span>
              </button>
            </header>
            <main className="flex flex-col gap-8 p-6">
              {/* PageHeading */}
              <div className="flex flex-wrap justify-between gap-3">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d141b] dark:text-slate-50 min-w-72">Formation: {initialCourse.name}</h1>
              </div>
              {/* Module List Container */}
              <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                {items.length > 0 ? (
                  items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/course/${courseId}/module/${item.id}`}
                      className="flex cursor-pointer items-center gap-4 bg-white dark:bg-background-dark/50 px-6 min-h-[72px] py-4 justify-between transition-colors hover:bg-background-light dark:hover:bg-background-dark"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-12 text-primary">
                          <span className="material-symbols-outlined">{getMaterialSymbol(item.icon)}</span> {/* Using getMaterialSymbol helper */}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-base font-medium leading-normal line-clamp-1 text-[#0d141b] dark:text-slate-50">{item.title}</p>
                          {item.description && (
                            <p className="text-sm font-normal leading-normal line-clamp-2 text-slate-500 dark:text-slate-400">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-slate-400 dark:text-slate-500">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 bg-white dark:bg-background-dark/50 p-10 text-center">
                    <div className="flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 size-16 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined !text-4xl">folder_off</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-[#0d141b] dark:text-slate-50">Aucun module trouvé</p>
                      <p className="text-sm text-normal leading-normal text-slate-500 dark:text-slate-400">Aucun module n'a été ajouté à cette formation.</p>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
