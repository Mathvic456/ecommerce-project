// Test script to explore country-state-city package API
const csc = require('country-state-city');

console.log('Testing country-state-city package...\n');

// Get all countries
const countries = csc.getAllCountries();
console.log(`Total countries: ${countries.length}`);
console.log('First 3 countries:');
countries.slice(0, 3).forEach(c => console.log(`  ${c.name} (${c.isoCode})`));

// Get states for a country
const usStates = csc.getStatesOfCountry('US');
console.log(`\nUS states: ${usStates.length}`);
console.log('First 3 US states:');
usStates.slice(0, 3).forEach(s => console.log(`  ${s.name} (${s.isoCode})`));

// Get cities for a state
const caCities = csc.getCitiesOfState('US', 'CA');
console.log(`\nCalifornia cities: ${caCities.length}`);
console.log('First 3 CA cities:');
caCities.slice(0, 3).forEach(c => console.log(`  ${c.name}`));

// Get country by code
const us = csc.getCountryByCode('US');
console.log(`\nUS country data:`, {
  name: us?.name,
  isoCode: us?.isoCode,
  currency: us?.currency,
  phonecode: us?.phonecode
});

console.log('\nPackage methods:');
console.log(Object.keys(csc).filter(key => typeof csc[key] === 'function'));