export const adminPage = (req, res) => {
  res.redirect("/admin/login");
};
export const loginPage = (req, res) => {
  if (req.session.isAuthenticated) {
    return res.redirect("/admin/dashboard");
  }
  res.render("admin/login", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};
export const login = (req, res) => {
  const { username, password } = req.body;

  // For demo purposes, using simple credentials
  // In a real app, you'd check against a database
  if (username === "admin" && password === "password") {
    req.session.isAuthenticated = true;
    req.session.user = { username, role: "admin" };
    return res.redirect("/admin/dashboard");
  }

  req.flash("error", "Invalid credentials");
  res.redirect("/admin/login");
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
};

// Protected admin routes - all routes under /admin/* except login
export const adminProtected = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.redirect("/admin/login");
  }
  next();
};
export const dashboard = (req, res) => {
  res.render("admin/dashboard", {
    user: req.session.user,
    title: "Dashboard",
    active: "dashboard",
  });
};
