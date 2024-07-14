import { Metadata } from 'next';


export const GRADIANTCOLOR =
  'bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text';

export const CLASSACTION = 'active:scale-95 transition duration-200';

export const metadata: Metadata = {
  title: 'Open Bran | Chat',
  description: 'Chat with the internet, chat with Open Bran.',
};

const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const uuid = (length: number=7) => {
  let result = ' ';
  const charactersLength = alphanumeric.length;
  for (let i = 0; i < length; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function isValidCollectionName(name: string): boolean {
  // Check if the name is between 3 and 63 characters long
  if (name.length < 3 || name.length > 63) {
    return false;
  }

  // Check if the name starts and ends with an alphanumeric character
  const alphanumericRegex = /^[a-zA-Z0-9].*[a-zA-Z0-9]$/;
  if (!alphanumericRegex.test(name)) {
    return false;
  }

  // Check if the name contains only alphanumeric characters, underscores, or hyphens
  const validCharactersRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validCharactersRegex.test(name)) {
    return false;
  }

  // Check if the name contains no two consecutive periods
  if (name.includes('..')) {
    return false;
  }

  // Check if the name is not a valid IPv4 address
  const ipv4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
  if (ipv4Regex.test(name)) {
    return false;
  }

  return true;
}

export function genSocketId(): string {
  const lengthRange = [32, 32]; // Fixed length of 20 characters
  const validCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';

  // Generate a name with a fixed length of 20 characters
  const length = lengthRange[0];

  // Ensure the name starts with an alphanumeric character
  name += validCharacters.charAt(Math.floor(Math.random() * 62));

  for (let i = 1; i < length - 4; i++) {
    name += validCharacters.charAt(Math.floor(Math.random() * validCharacters.length));
  }

  // Add a fixed suffix of 'AAAA'
  // name += 'AAAA';

  // Ensure the last character is an alphanumeric character
  name += validCharacters.charAt(Math.floor(Math.random() * 62));

  // Ensure the generated name meets all the requirements
  while (!isValidCollectionName(name)) {
    name = genSocketId();
  }

  return name;
}

function insertRandomHyphens(input: string, maxHyphens: number = Math.floor(input.length / 4)): string {
  const inputArray = input.split('');
  const positions: number[] = [];
  const availablePositions: number[] = [];

  // Generate available positions
  for (let i = 1; i < input.length - 1; i++) {
    availablePositions.push(i);
  }

  // Generate random positions for hyphens
  while (positions.length < maxHyphens && availablePositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions.splice(randomIndex, 1)[0];
    positions.push(position);
  }

  // Sort positions in ascending order
  positions.sort((a, b) => a - b);

  // Insert hyphens at the calculated positions
  for (const position of positions) {
    inputArray.splice(position, 0, '-');
  }

  return inputArray.join('');
}

export const genUrlId = () => {
  return insertRandomHyphens(genSocketId(),4)
}