import { getStudentService } from "../services/student.service.ts";

export async function getStudent(cookie: string) {
  return getStudentService(cookie);
}
