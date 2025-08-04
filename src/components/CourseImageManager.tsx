import course1 from "@/assets/golf-course-1.jpg";
import course2 from "@/assets/golf-course-2.jpg";
import course3 from "@/assets/golf-course-3.jpg";
import course4 from "@/assets/golf-course-4.jpg";
import course5 from "@/assets/golf-course-5.jpg";
import course6 from "@/assets/golf-course-6.jpg";
import course7 from "@/assets/golf-course-7.jpg";
import course8 from "@/assets/golf-course-8.jpg";

export const courseImages = {
  '/src/assets/golf-course-1.jpg': course1,
  '/src/assets/golf-course-2.jpg': course2,
  '/src/assets/golf-course-3.jpg': course3,
  '/src/assets/golf-course-4.jpg': course4,
  '/src/assets/golf-course-5.jpg': course5,
  '/src/assets/golf-course-6.jpg': course6,
  '/src/assets/golf-course-7.jpg': course7,
  '/src/assets/golf-course-8.jpg': course8,
};

export const getGolfCourseImage = (imagePath: string): string => {
  return courseImages[imagePath] || '/placeholder.svg';
};