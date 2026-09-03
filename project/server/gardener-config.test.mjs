import assert from 'node:assert/strict';
import test from 'node:test';
import {
  containsImmediateDanger,
  normalizeCheckIn,
  normalizeGardenerResponse,
} from './gardener-config.mjs';

const validResponse = {
  message: 'A low-energy day deserves a gentle plan.',
  tasks: [
    {
      type: 'hydration',
      description: 'Start with water after noticing that dehydrated feeling.',
      quantity: 3,
      unit: 'glasses',
    },
    {
      type: 'stretching',
      description: 'Move gently for a few minutes without asking too much of your energy.',
    },
    {
      type: 'breathing',
      description: 'Take two quiet minutes to settle into a steady Box Breathing rhythm.',
    },
  ],
};

test('accepts and sanitizes a valid personalized Gardener response', () => {
  assert.deepEqual(normalizeGardenerResponse(validResponse), validResponse);
});

test('rejects unsupported activities', () => {
  const invalidResponse = structuredClone(validResponse);
  invalidResponse.tasks[0].type = 'cold-plunge';
  assert.equal(normalizeGardenerResponse(invalidResponse), null);
});

test('rejects unsafe hydration quantities', () => {
  const invalidResponse = structuredClone(validResponse);
  invalidResponse.tasks[0].quantity = 4;
  assert.equal(normalizeGardenerResponse(invalidResponse), null);
});

test('rejects duplicate activities', () => {
  const invalidResponse = structuredClone(validResponse);
  invalidResponse.tasks[2].type = 'stretching';
  assert.equal(normalizeGardenerResponse(invalidResponse), null);
});

test('keeps only the three allowed Care inputs', () => {
  assert.deepEqual(normalizeCheckIn({
    mood: 'calm',
    sleepHours: 8,
    writtenResponse: '  ',
    name: 'Must not leave the client',
    email: 'not-sent@example.com',
  }), {
    mood: 'calm',
    sleepHours: 8,
    writtenResponse: '',
  });
});

test('detects clear immediate-danger language without flagging an anxious exam check-in', () => {
  assert.equal(containsImmediateDanger('I have a plan to kill myself tonight.'), true);
  assert.equal(containsImmediateDanger("I have an exam tomorrow and I can't stop thinking about it."), false);
});
