import { useEffect, useState } from "react";

export const useAdminSession = () => {
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		let isMounted = true;

		fetch("/api/blog-session", {
			credentials: "same-origin",
		})
			.then((response) => {
				if (isMounted) {
					setStatus(response.ok ? "authenticated" : "unauthenticated");
				}
			})
			.catch(() => {
				if (isMounted) {
					setStatus("unauthenticated");
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		adminSessionStatus: status,
		isAdmin: status === "authenticated",
		isLoadingAdminSession: status === "loading",
	};
};
