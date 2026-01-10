import { loadUserNavbar } from './userNavbar.js';
import { loadUserFooter } from './userFooter.js';

export async function init() {
  await loadUserNavbar();
  await loadUserFooter();
  console.log("About page loaded with navbar & footer");
}