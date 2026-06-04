/**
 * Unifies setting up DOM event listeners for script compilation triggers.
 * Automatically selects all input, select, and textarea elements on the page,
 * excludes any inputs specified (like download names), and binds 'input' and 'change'
 * events to run the compilation callback.
 * 
 * @param {Function} compileCallback - The callback function to run when an input changes.
 * @param {Array<string>} [excludeIds=['download-name-input']] - List of DOM element IDs to exclude from triggering compilation.
 */
export function setupCompilerTriggers(compileCallback, excludeIds = ['download-name-input']) {
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (!excludeIds.includes(input.id)) {
      input.addEventListener('input', compileCallback);
      input.addEventListener('change', compileCallback);
    }
  });
}
