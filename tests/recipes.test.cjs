const test = require('node:test');
const assert = require('node:assert/strict');
const { decodeRecipe, emptyRecipe, parseRecipe, recipeLines } = require('../.test-build/services/recipeLogic.js');

test('una receta conserva ingredientes y pasos tras serializarse', () => {
  const recipe = parseRecipe({ title: ' Tortilla ', ingredients: '2 huevos\n1 tomate', steps: 'Batir.\nCocinar.' });
  assert.equal(recipe.title, 'Tortilla');
  assert.deepEqual(decodeRecipe(JSON.stringify(recipe)), recipe);
  assert.deepEqual(recipeLines(' Batir.\n\n Cocinar. '), ['Batir.', 'Cocinar.']);
});
test('recetas corruptas se rechazan y un día vacío es válido', () => {
  assert.deepEqual(decodeRecipe(null), emptyRecipe());
  assert.deepEqual(parseRecipe(emptyRecipe()), emptyRecipe());
  for (const raw of ['{', 'null', '{"title":"Plato","steps":[]}']) assert.throws(() => decodeRecipe(raw));
  assert.throws(() => parseRecipe({ title: '', ingredients: '2 huevos', steps: '' }), /nombre/);
  assert.throws(() => parseRecipe({ title: 'Plato', ingredients: '', steps: 'a'.repeat(6001) }), /tamaño/);
});
