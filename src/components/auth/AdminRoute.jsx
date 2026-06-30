import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../Loader/Loader";

const sessionEndpoint = "/api/blog-session";

export const AdminRoute = ({ children }) => {
	const location = useLocation();
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		let isMounted = true;

		const checkSession = async () => {
			try {
				const response = await fetch(sessionEndpoint, {
					credentials: "same-origin",
				});

				if (isMounted) {
					setStatus(
						response.ok ? "authenticated" : "unauthenticated",
					);
				}
			} catch {
				if (isMounted) {
					setStatus("unauthenticated");
				}
			}
		};

		checkSession();
		return () => {
			isMounted = false;
		};
	}, []);

	if (status === "loading") {
		return (
			<div className="admin-route-status">
				<Loader text="Checking session..." isFullScreen={true} />
			</div>
		);
	}

	if (status === "unauthenticated") {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return children;
};

AdminRoute.propTypes = {
	children: PropTypes.node.isRequired,
};
