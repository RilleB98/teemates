import { Course } from "@/data/golfCourses";
import course1 from "@/assets/course1.jpg";

interface ParsedGolfClub {
  name: string;
  location?: string;
  region?: string;
}

export class GolfDataParser {
  private static readonly defaultImage = course1;
  
  /**
   * Parses crawled markdown data and extracts golf club information
   */
  static parseMarkdownData(markdownContent: string): ParsedGolfClub[] {
    const clubs: ParsedGolfClub[] = [];
    const lines = markdownContent.split('\n');
    
    console.log('Parsing markdown content, total lines:', lines.length);
    console.log('First 20 lines of content:', lines.slice(0, 20));
    console.log('Sample content around middle:', lines.slice(Math.floor(lines.length/2), Math.floor(lines.length/2) + 10));
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and obvious non-club content
      if (!line || line.length < 5) continue;
      
      // Skip common website elements and navigation
      if (this.isWebsiteElement(line)) continue;
      
      // Look for actual golf club names
      if (this.isActualGolfClub(line)) {
        const parsedClub = this.parseGolfClubLine(line);
        if (parsedClub && !clubs.some(club => club.name === parsedClub.name)) {
          clubs.push(parsedClub);
          console.log('Found golf club:', parsedClub.name);
        }
      }
    }
    
    console.log('Total clubs found:', clubs.length);
    return clubs;
  }
  
  /**
   * Converts parsed golf clubs to Course objects
   */
  static convertToCourses(parsedClubs: ParsedGolfClub[]): Course[] {
    return parsedClubs.map((club, index) => {
      const location = this.extractLocation(club);
      const coordinates = this.getRandomCoordinatesInSweden();
      
      return {
        name: club.name,
        location: location,
        rating: this.generateRealisticRating(),
        difficulty: this.generateRandomDifficulty(),
        holes: this.generateRandomHoles(),
        price: this.generateRealisticPrice(),
        image: this.defaultImage,
        latitude: coordinates.lat,
        longitude: coordinates.lng
      };
    });
  }
  
  
  private static isWebsiteElement(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Common website elements to skip
    const websiteElements = [
      'följ våra största ögonblick', 'för klubbar', 'logo', 'https://', '©',
      'huvudpartners', 'officiella partners', 'kategoripartners',
      'sök på webbplatsen', 'stäng', 'läs mer', 'tillgänglighetsredogörelse',
      'personuppgiftshantering', 'till klubb.golf.se', 'till toppen',
      'hjälpte den här informationen dig', 'sidan publicerades',
      'gå till sidans innehåll', 'spela golf', 'regler & handicap',
      'tävling', 'elit & landslag', 'utbildning', 'om golfsverige',
      'hitta golfklubb', 'golfklubbar i sverige', 'välkommen till nya golf.se',
      'börja spela golf', 'ta grönt kort', 'sök medlemskap', 'rent spel',
      'det här är golf', 'golfregler', 'handicapregler', 'golfvett',
      'min golf', 'start', 'google', 'terms', 'report a map error',
      'open this area in google maps'
    ];
    
    return websiteElements.some(element => lowerText.includes(element)) ||
           text.includes('[') || text.includes(']') ||
           /^\d+$/.test(text) || // Just numbers
           text.length > 100; // Very long lines are likely not club names
  }
  
  private static isActualGolfClub(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Must contain specific golf club indicators
    const clubIndicators = [
      'golfklubb', 'golf club', 'gk ', ' gk', 'golf & country club',
      'country club', 'golfbana', 'golf course'
    ];
    
    const hasClubIndicator = clubIndicators.some(indicator => lowerText.includes(indicator));
    
    // OR contain "golf" but with specific patterns that indicate it's a club name
    const hasGolfWithContext = lowerText.includes('golf') && (
      lowerText.includes(' golf ') ||
      lowerText.endsWith(' golf') ||
      lowerText.startsWith('golf ') ||
      lowerText.includes('golf ab') ||
      lowerText.includes('golf resort')
    );
    
    if (!hasClubIndicator && !hasGolfWithContext) return false;
    
    // Additional validation
    const isReasonableLength = text.length >= 8 && text.length <= 60;
    const hasLetters = /[a-zA-ZåäöÅÄÖ]/.test(text);
    const notJustGeneric = !/^(golf|golfklubb|golf club)$/i.test(lowerText);
    
    return isReasonableLength && hasLetters && notJustGeneric;
  }

  private static isLikelyGolfClubName(text: string): boolean {
    const golfKeywords = [
      'golf', 'gk', 'golfklubb', 'golfbana', 'country club',
      'golf club', 'golf course', 'golfkurs'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Must contain golf-related keyword
    const hasGolfKeyword = golfKeywords.some(keyword => lowerText.includes(keyword));
    
    // Should be a reasonable length for a club name
    const isReasonableLength = text.length >= 5 && text.length <= 80;
    
    // Exclude obvious non-club names
    const excludeKeywords = [
      'spela golf', 'börja spela', 'regler', 'handicap', 'tävling',
      'utbildning', 'pressrum', 'kontakt', 'cookies', 'personuppgifter'
    ];
    const isNotExcluded = !excludeKeywords.some(keyword => lowerText.includes(keyword));
    
    return hasGolfKeyword && isReasonableLength && isNotExcluded;
  }
  
  private static parseGolfClubLine(line: string): ParsedGolfClub | null {
    // Clean up the line
    let cleanedName = line
      .replace(/^[#\-\*\+\s]+/, '') // Remove markdown formatting
      .replace(/\[|\]/g, '') // Remove brackets
      .replace(/\(.*?\)/g, '') // Remove parentheses content
      .trim();
    
    if (cleanedName.length < 3) return null;
    
    // Try to extract location from the name
    const locationMatches = cleanedName.match(/,\s*([^,]+)$/);
    let location = 'Sverige';
    
    if (locationMatches) {
      location = locationMatches[1].trim();
      cleanedName = cleanedName.replace(/,\s*[^,]+$/, '').trim();
    }
    
    return {
      name: cleanedName,
      location: location
    };
  }
  
  private static extractLocation(club: ParsedGolfClub): string {
    if (club.location && club.location !== 'Sverige') {
      return club.location;
    }
    
    // Try to guess region from club name
    const name = club.name.toLowerCase();
    
    if (name.includes('stockholm') || name.includes('södermalm') || name.includes('östermalm')) {
      return 'Stockholm';
    } else if (name.includes('göteborg') || name.includes('västra götaland')) {
      return 'Göteborg';
    } else if (name.includes('malmö') || name.includes('skåne')) {
      return 'Malmö';
    } else if (name.includes('uppsala')) {
      return 'Uppsala';
    } else if (name.includes('västerås')) {
      return 'Västerås';
    } else if (name.includes('linköping')) {
      return 'Linköping';
    }
    
    return 'Sverige';
  }
  
  private static getRandomCoordinatesInSweden(): { lat: number; lng: number } {
    // Sweden approximate bounds
    const minLat = 55.0;
    const maxLat = 69.0;
    const minLng = 10.0;
    const maxLng = 24.0;
    
    return {
      lat: parseFloat((Math.random() * (maxLat - minLat) + minLat).toFixed(4)),
      lng: parseFloat((Math.random() * (maxLng - minLng) + minLng).toFixed(4))
    };
  }
  
  private static generateRealisticRating(): number {
    // Generate rating between 3.5 and 5.0
    return parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
  }
  
  private static generateRandomDifficulty(): string {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }
  
  private static generateRandomHoles(): number {
    const holeOptions = [9, 18, 27];
    return holeOptions[Math.floor(Math.random() * holeOptions.length)];
  }
  
  private static generateRealisticPrice(): string {
    // Generate price between 250-1200 SEK
    const price = Math.floor(Math.random() * 950) + 250;
    return `${price} SEK`;
  }
}