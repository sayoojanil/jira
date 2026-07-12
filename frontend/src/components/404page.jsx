import React from "react";
import { Wrench } from "lucide-react";

const SiteDown = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center bg-white">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100">
          <Wrench
            size={40}
            className="text-sky-600 animate-spin"
            style={{ animationDuration: "8s" }}
          />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold text-sky-700">
          Website Under Maintenance
        </h1>

        {/* Description */}
        <p className="mt-3 text-gray-600">
          We're making some improvements. Please check back in a little while.
        </p>

        {/* Loader */}
        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
};

export default SiteDown;