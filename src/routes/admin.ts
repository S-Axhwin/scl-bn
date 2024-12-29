import { Hono } from "hono"
import { createClass, getStudents, login, getClassesGroupedByGrade, createTeachers, assignTeaToClasses, createSub, assignTeaToSub, createStudent, updateSectionStu } from "../controllers/admin";
import { adminMiddle } from "../middleware/admin";

const adminRoute = new Hono();

adminRoute.post("/login", login);

adminRoute.get("/student", adminMiddle, getStudents)
adminRoute.post("/student", adminMiddle, createStudent)
adminRoute.put("/student", adminMiddle, updateSectionStu)

adminRoute.post("/class", adminMiddle, createClass)
adminRoute.get("/class", adminMiddle, getClassesGroupedByGrade)

adminRoute.post("/teacher", adminMiddle, createTeachers);
adminRoute.put("/teacher", adminMiddle, assignTeaToClasses);

adminRoute.post("/subject", adminMiddle, createSub);
adminRoute.put("/subject", adminMiddle, assignTeaToSub);

export default adminRoute;