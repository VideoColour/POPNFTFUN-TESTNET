/**
 * Diamond Property Mapping
 * 
 * Purpose:
 * This module provides functionality to map diamond properties between string representations
 * and numeric values, facilitating efficient storage and comparison of diamond characteristics.
 * 
 * Key Features:
 * 1. Bidirectional mapping between string representations and numeric values for diamond properties.
 * 2. Supports multiple string values mapping to the same numeric value in the forward direction.
 * 3. Implements a canonical reverse mapping, always using the first encountered string value
 *    for each numeric value in the reverse direction.
 * 
 * Implementation Details:
 * - Forward mapping allows multiple strings to map to the same number (e.g., both 'FL' and 'Flawless' map to 1).
 * - Reverse mapping is created using a 'first-come, first-served' approach, ensuring a consistent
 *   string representation when converting back from numbers.
 * - The createInverseMap function implements this logic, creating reverse mappings for all properties.
 * 
 * Usage:
 * - Use mapDiamondProperties to convert string values to numeric representations.
 * - Use reverseMappingDiamondProperties to convert numeric values back to canonical string representations.
 

  // Example usage (consider moving these to the end of the file)

  const mappedValues = mapDiamondProperties('E', 'VVS1', 'Excellent', 'None', 'Very Good', 'Good');
  console.log(mappedValues);

  const originalValues = reverseMappingDiamondProperties(5, 3, 5, 1, 4, 3);
  console.log(originalValues);
*/

// Define types for the properties
// prettier-ignore
type Color = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 
             'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
type Clarity = 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | 'I3';
type Cut          = 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
type Polish       = 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
type Symmetry     = 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
type Fluorescence = 'None' | 'Faint' | 'Medium' | 'Strong' | 'Very Strong';

// Define mapping objects for each property
const colorMap: Record<string, number> = {
  'UNDEFINED': 0,
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 'J': 10,
  'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 'S': 19,
  'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
};

const clarityMap: Record<string, number> = {
  'UNDEFINED': 0,
  'FL': 1,    // Flawless
  'Flawless': 1,    // Flawless
  'IF': 2,    // Internally Flawless
  'VVS1': 3,  // Very Very Slightly Included 1
  'VVS2': 4,  // Very Very Slightly Included 2
  'VS1': 5,   // Very Slightly Included 1
  'VS2': 6,   // Very Slightly Included 2
  'SI1': 7,   // Slightly Included 1
  'SI2': 8,   // Slightly Included 2
  'I1': 9,    // Included 1
  'I2': 10,   // Included 2
  'I3': 11    // Included 3
};

const cutMap: Record<string, number> = {
  'UNDEFINED': 0,
  'Poor': 1,
  'Fair': 2,
  'Good': 3,
  'Very Good': 4,
  'Excellent': 5
};

const fluorescenceMap: Record<string, number> = {
  'UNDEFINED': 0,
  'None': 1,
  'Faint': 2,
  'Medium': 3,
  'Strong': 4,
  'Very Strong': 5
};

const polishMap: Record<string, number> = {
  'UNDEFINED': 0,
  'Poor': 1,
  'Fair': 2,
  'Good': 3,
  'Very Good': 4,
  'Excellent': 5
};

const symmetryMap: Record<string, number> = {
  'UNDEFINED': 0,
  'Poor': 1,
  'Fair': 2,
  'Good': 3,
  'Very Good': 4,
  'Excellent': 5
};

// Generic function to create inverse map
function createInverseMap(map: Record<string, number>): Record<number, string> {
  const inverseMap: Record<number, string> = {};
  for (const [key, value] of Object.entries(map)) {
    if (!(value in inverseMap)) {
      inverseMap[value] = key;
    }
  }
  return inverseMap;
}

// Create inverse maps using the new function
const inverseColorMap = createInverseMap(colorMap);
const inverseClarityMap = createInverseMap(clarityMap);
const inverseCutMap = createInverseMap(cutMap);
const inverseFluorescenceMap = createInverseMap(fluorescenceMap);
const inversePolishMap = createInverseMap(polishMap);
const inverseSymmetryMap = createInverseMap(symmetryMap);

// Function to map string values to uint8
export function mapPropertyToUint8(value: string, map: Record<string, number>): number {
  const mappedValue = map[value];
  if (mappedValue === undefined) {
    throw new Error(`Invalid value: ${value}`);
  }
  return mappedValue;
}

// Function for reverse mapping
export function mapUint8ToProperty(value: number | undefined, inverseMap: Record<number, string>): string {
  if (value === undefined) return 'UNDEFINED';
  const mappedValue = inverseMap[value];
  if (mappedValue === undefined) {
    throw new Error(`Invalid value: ${value}`);
  }
  return mappedValue;
}

// // Usage example
// export function mapDiamondProperties(
//   color: string,
//   clarity: string,
//   cut: string,
//   fluorescence: string,
//   polish: string,
//   symmetry: string
// ): {
//   colorValue: number,
//   clarityValue: number,
//   cutValue: number,
//   fluorescenceValue: number,
//   polishValue: number,
//   symmetryValue: number
// } {
//   return {
//     colorValue: mapPropertyToUint8(color, colorMap),
//     clarityValue: mapPropertyToUint8(clarity, clarityMap),
//     cutValue: mapPropertyToUint8(cut, cutMap),
//     fluorescenceValue: mapPropertyToUint8(fluorescence, fluorescenceMap),
//     polishValue: mapPropertyToUint8(polish, polishMap),
//     symmetryValue: mapPropertyToUint8(symmetry, symmetryMap)
//   };
// }

// Reverse mapping function
export function reverseMappingDiamondProperties(
  colorValue: number,
  clarityValue: number,
  cutValue: number,
  fluorescenceValue: number,
  polishValue: number,
  symmetryValue: number
): {
  color: Color,
  clarity: Clarity,
  cut: Cut,
  fluorescence: Fluorescence,
  polish: Polish,
  symmetry: Symmetry
} {
  return {
    color: mapUint8ToProperty(colorValue, inverseColorMap) as Color,
    clarity: mapUint8ToProperty(clarityValue, inverseClarityMap) as Clarity,
    cut: mapUint8ToProperty(cutValue, inverseCutMap) as Cut,
    fluorescence: mapUint8ToProperty(fluorescenceValue, inverseFluorescenceMap) as Fluorescence,
    polish: mapUint8ToProperty(polishValue, inversePolishMap) as Polish,
    symmetry: mapUint8ToProperty(symmetryValue, inverseSymmetryMap) as Symmetry
  };
}

