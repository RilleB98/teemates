// Import all 20 golf course images
import golf01 from "@/assets/golf-01.jpg";
import golf02 from "@/assets/golf-02.jpg";
import golf03 from "@/assets/golf-03.jpg";
import golf04 from "@/assets/golf-04.jpg";
import golf05 from "@/assets/golf-05.jpg";
import golf06 from "@/assets/golf-06.jpg";
import golf07 from "@/assets/golf-07.jpg";
import golf08 from "@/assets/golf-08.jpg";
import golf09 from "@/assets/golf-09.jpg";
import golf10 from "@/assets/golf-10.jpg";
import golf11 from "@/assets/golf-11.jpg";
import golf12 from "@/assets/golf-12.jpg";
import golf13 from "@/assets/golf-13.jpg";
import golf14 from "@/assets/golf-14.jpg";
import golf15 from "@/assets/golf-15.jpg";
import golf16 from "@/assets/golf-16.jpg";
import golf17 from "@/assets/golf-17.jpg";
import golf18 from "@/assets/golf-18.jpg";
import golf19 from "@/assets/golf-19.jpg";
import golf20 from "@/assets/golf-20.jpg";

// Array of all golf course images for easy access
const golfImages = [
  golf01, golf02, golf03, golf04, golf05, golf06, golf07, golf08, golf09, golf10,
  golf11, golf12, golf13, golf14, golf15, golf16, golf17, golf18, golf19, golf20
];

// Legacy course images for compatibility
export const courseImages = {
  '/src/assets/golf-course-1.jpg': golf01,
  '/src/assets/golf-course-2.jpg': golf02,
  '/src/assets/golf-course-3.jpg': golf03,
  '/src/assets/golf-course-4.jpg': golf04,
  '/src/assets/golf-course-5.jpg': golf05,
  '/src/assets/golf-course-6.jpg': golf06,
  '/src/assets/golf-course-7.jpg': golf07,
  '/src/assets/golf-course-8.jpg': golf08,
};

// Function to get a golf course image based on the course name
// This distributes images alphabetically across all golf courses
export const getGolfCourseImageByName = (courseName: string): string => {
  // Simple hash function to generate a consistent index based on course name
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    const char = courseName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get absolute value and map to image array length
  const imageIndex = Math.abs(hash) % golfImages.length;
  return golfImages[imageIndex];
};

// Updated function that handles both legacy paths and new course-based images
export const getGolfCourseImage = (imagePath: string, courseName?: string): string => {
  // If we have a course name, use the new image distribution system
  if (courseName) {
    return getGolfCourseImageByName(courseName);
  }
  
  // Legacy support for existing image paths
  if (courseImages[imagePath]) {
    return courseImages[imagePath];
  }
  
  // If no valid path and no course name, return first image as fallback
  return golf01;
};