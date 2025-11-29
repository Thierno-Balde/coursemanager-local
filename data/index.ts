import type { AppData } from '../types';
import rawData from './db.json';
import { migrateData } from '../utils/migrate';

// Typed export of the seed data so imports like "../data" resolve correctly
export const COURSE_DATA: AppData = migrateData(rawData);
