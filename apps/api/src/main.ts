import 'reflect-metadata';
import { loadEnvironment } from './config/environment';

loadEnvironment();
// Module decorators read environment variables while their imports are evaluated.
void import('./bootstrap').then(({ bootstrap }) => bootstrap());
