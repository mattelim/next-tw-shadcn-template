import { languages } from "@/components/CodeRunnerWrapper";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return str; // Check for empty string
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeLangStr(str0: string) {
  if (str0.toLowerCase().startsWith('javascript')) {
    str0 = str0.substring(10);
  } else if (str0.toLowerCase().startsWith('js')) {
    str0 = str0.substring(2);
  } else if (str0.toLowerCase().startsWith('python')) {
    str0 = str0.substring(6);
  } else if (str0.toLowerCase().startsWith('py')) {
    str0 = str0.substring(2);
  } else if (str0.toLowerCase().startsWith('pseudocode')) {
    str0 = str0.substring(10);
  } else if (str0.toLowerCase().startsWith('plaintext')) {
    str0 = str0.substring(9);
  }
  return str0.trim();
}

export function handleCommonErrors(res0: string) {
  if (res0.startsWith('function ') || res0.startsWith('const ') || res0.startsWith('let ') || res0.startsWith('var ') || res0.startsWith('class ') || res0.startsWith('console.log')) {
    return res0;
  }
  if (res0.startsWith('```')) {
    res0 = res0.split('```')[1];
    res0 = removeLangStr(res0);
  } else {
    const res0Arr = res0.split('```');
    // console.log('res0Arr length: ' + res0Arr.length);

    if (res0Arr.length <= 1) {
      res0Arr[0] = '//' + res0Arr[0];
    } else {
      for (let i = 0; i < res0Arr.length; i++) {
        if (i % 2 === 0) {
          res0Arr[i] = '/* ' + res0Arr[i] + '*/ ';
        } else {
          res0Arr[i] = removeLangStr(res0Arr[i]);
        }
      }
    }
    res0 = res0Arr.join('\n');
  }
  return res0;
}

export function commentPrefixForLanguage(selectedLanguage: languages) {
  switch (selectedLanguage) {
    case 'python':
      return '#';
    case 'javascript':
      return '//';
    default:
      return '#';
  }
}