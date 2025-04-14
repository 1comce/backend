$(document).ready(function () {
  // Function to check if we're in mobile view
  function isMobileView() {
    // This can be adjusted based on your CSS breakpoints
    return window.innerWidth < 768;
  }

  // Initialize sidebar state based on device and saved preferences
  function initializeSidebar() {
    if (isMobileView()) {
      // For mobile: check if sidebar was previously active
      if (localStorage.getItem("mobileActive") === "true") {
        $("#sidebar").addClass("mobile-active");
        $("#sidebar-backdrop").addClass("active");
      }
    } else {
      // For desktop: check if sidebar was previously collapsed
      if (localStorage.getItem("sidebarCollapsed") === "true") {
        $("#sidebar").addClass("collapsed");
        $("#main-content").addClass("expanded");
      }
    }
  }

  // Initialize on page load
  initializeSidebar();

  // Main sidebar toggle (works differently for mobile vs desktop)
  $("#sidebar-toggle").on("click", function () {
    if (isMobileView()) {
      // Mobile behavior
      $("#sidebar").toggleClass("mobile-active");
      $("#sidebar-backdrop").toggleClass("active");
      localStorage.setItem(
        "mobileActive",
        $("#sidebar").hasClass("mobile-active")
      );
    } else {
      // Desktop behavior
      $("#sidebar").toggleClass("collapsed");
      $("#main-content").toggleClass("expanded");
      localStorage.setItem(
        "sidebarCollapsed",
        $("#sidebar").hasClass("collapsed")
      );
    }
  });

  // Dedicated mobile sidebar toggle
  $("#sidebar-toggle-mobile").on("click", function () {
    $("#sidebar").toggleClass("mobile-active");
    $("#sidebar-backdrop").toggleClass("active");
    localStorage.setItem(
      "mobileActive",
      $("#sidebar").hasClass("mobile-active")
    );
  });

  // Backdrop click - only affects mobile sidebar
  $("#sidebar-backdrop").on("click", function () {
    $("#sidebar").removeClass("mobile-active");
    $("#sidebar-backdrop").removeClass("active");
    localStorage.setItem("mobileActive", false);
  });

  // Handle window resize to adjust sidebar behavior
  $(window).resize(function () {
    // If transitioning from mobile to desktop view and sidebar is open
    if (!isMobileView() && $("#sidebar").hasClass("mobile-active")) {
      // Remove mobile classes
      $("#sidebar").removeClass("mobile-active");
      $("#sidebar-backdrop").removeClass("active");

      // Apply desktop state based on saved preference
      if (localStorage.getItem("sidebarCollapsed") === "true") {
        $("#sidebar").addClass("collapsed");
        $("#main-content").addClass("expanded");
      }
    }
  });

  // User dropdown
  $("#user-dropdown-toggle").on("click", function (e) {
    e.stopPropagation();
    $("#user-dropdown-menu").toggleClass("active");
  });

  // Close dropdown when clicking outside
  $(document).on("click", function (e) {
    if (
      !$(e.target).closest("#user-dropdown-toggle").length &&
      !$(e.target).closest("#user-dropdown-menu").length
    ) {
      $("#user-dropdown-menu").removeClass("active");
    }
  });

  // Add smooth transitions to all buttons
  $(".btn").on("mouseenter", function () {
    $(this).css("transition", "all 0.3s ease");
  });

  // Add tooltip functionality to action buttons
  $(".btn-info").attr("title", "Edit item");
  $(".btn-danger").attr("title", "Delete item");
  $(".btn-warning").attr("title", "Mark as ignored");

  // Initialize Bootstrap tooltips
  if (typeof bootstrap !== "undefined") {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll("[title]")
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Add animation to cards
  $(".card").hover(
    function () {
      $(this).css("transform", "translateY(-5px)");
      $(this).css("transition", "transform 0.3s ease");
      $(this).css("box-shadow", "0 10px 20px rgba(0,0,0,0.1)");
    },
    function () {
      $(this).css("transform", "translateY(0)");
      $(this).css("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");
    }
  );
});
