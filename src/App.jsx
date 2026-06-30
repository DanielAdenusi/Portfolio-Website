import "./App.css";
import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
} from "react-router-dom";

import { Portfolio } from "./pages/Portfolio/Portfolio";
import { Blog } from "./pages/blog/Blog";
import { BlogAdmin } from "./pages/blog/BlogAdmin";
import { BlogPost } from "./pages/blog/BlogPost";
import { Login } from "./pages/login/Login";
import { HomeAdmin } from "./pages/home/HomeAdmin";
import { ProjectAdmin } from "./pages/projects/ProjectAdmin";
import { Projects } from "./pages/projects/Projects";
import { ProjectDetail } from "./pages/projects/ProjectDetail";
import { AdminRoute } from "./components/auth/AdminRoute";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Portfolio />} />
				<Route
					path="/home/admin"
					element={
						<AdminRoute>
							<HomeAdmin />
						</AdminRoute>
					}
				/>
				<Route path="/projects" element={<Projects />} />
				<Route
					path="/projects/admin"
					element={
						<AdminRoute>
							<ProjectAdmin />
						</AdminRoute>
					}
				/>
				<Route
					path="/projects/:projectId"
					element={<ProjectDetail />}
				/>
				<Route path="/blog" element={<Blog />} />
				<Route path="/login" element={<Login />} />
				<Route
					path="/blog/login"
					element={<Navigate to="/login" replace />}
				/>
				<Route
					path="/blog/admin"
					element={
						<AdminRoute>
							<BlogAdmin />
						</AdminRoute>
					}
				/>
				<Route path="/blog/:postId" element={<BlogPost />} />
				<Route
					path="/project"
					element={<Navigate to="/projects" replace />}
				/>
			</Routes>
		</Router>
	);
}
