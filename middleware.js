const cookieName = "portfolio_blog_admin";

export default function middleware(request) {
	const url = new URL(request.url);

	if (!url.pathname.startsWith("/blog/admin")) {
		return;
	}

	const hasAdminCookie = request.headers
		.get("cookie")
		?.split(";")
		.some((cookie) => cookie.trim().startsWith(`${cookieName}=`));

	if (hasAdminCookie) {
		return;
	}

	url.pathname = "/login";
	url.searchParams.set("from", request.nextUrl?.pathname || "/blog/admin");

	return Response.redirect(url);
}

export const config = {
	matcher: ["/blog/admin/:path*"],
};
