import type { AppData } from '../types';
import rawData from './db.json';

// Typed export of the seed data so imports like "../data" resolve correctly
export const COURSE_DATA: AppData = rawData as AppData;
