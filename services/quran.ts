import { Surah, Verse } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) throw new Error('Failed to fetch Surah list');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Surah list:', error);
    throw error;
  }
};

export const fetchSurahVerses = async (surahNumber: number): Promise<Verse[]> => {
  try {
    // Fetch Arabic, Sahih International Translation, and Transliteration
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.sahih,en.transliteration`);
    if (!response.ok) throw new Error('Failed to fetch verses');
    const data = await response.json();
    
    // data.data is an array of 3 editions
    const arabicData = data.data[0];
    const translationData = data.data[1];
    const transliterationData = data.data[2];

    return arabicData.ayahs.map((ayah: any, index: number) => ({
      id: ayah.number, // Global verse number
      surah: surahNumber,
      number: ayah.numberInSurah,
      arabic: ayah.text,
      translation: translationData.ayahs[index].text,
      transliteration: transliterationData.ayahs[index].text
    }));
  } catch (error) {
    console.error('Error fetching verses:', error);
    throw error;
  }
};

export const searchQuran = async (query: string, surahLimit?: number): Promise<Verse[]> => {
  try {
    // API Route: /search/{query}/{scope}/{edition}
    // Scope can be 'all' or a surah number
    const scope = surahLimit ? surahLimit : 'all';
    const response = await fetch(`${BASE_URL}/search/${query}/${scope}/en.sahih`);
    
    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    
    // Map matches to our Verse type
    // Note: Search results don't give us Transliteration or Arabic in the same call easily 
    // without multiple edition requests, so we will use the English text provided.
    // The matches array contains { text, number, surah: { number, name, englishName ... } }
    
    return data.data.matches.map((match: any) => ({
      id: match.number,
      surah: match.surah.number,
      number: match.numberInSurah,
      arabic: "", // Search endpoint doesn't return Arabic text by default
      transliteration: "", // Search endpoint doesn't return transliteration
      translation: match.text,
      // We add a custom property to store surah name for display
      surahName: match.surah.englishName
    }));
  } catch (error) {
    console.error('Error searching Quran:', error);
    return [];
  }
};
