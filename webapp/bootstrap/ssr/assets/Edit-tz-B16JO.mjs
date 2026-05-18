import { jsxs, jsx } from "react/jsx-runtime";
import { A as Authenticated } from "./AuthenticatedLayout-DuqH5o4I.mjs";
import DeleteUserForm from "./DeleteUserForm-Uhkww5qD.mjs";
import UpdatePasswordForm from "./UpdatePasswordForm-DrpJAyAX.mjs";
import UpdateProfileInformation from "./UpdateProfileInformationForm-DwngIx5O.mjs";
import { Head } from "@inertiajs/react";
import "react";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "lucide-react";
import "./SeoHead-Bfgu-MHE.mjs";
import "./InputError-cRVTeK4i.mjs";
import "./InputLabel-uXgJWz9w.mjs";
import "./Modal-BnFbDATV.mjs";
import "./TextInput-Dmygz_uX.mjs";
import "./PrimaryButton-C-TDjBGq.mjs";
function Edit({ auth, mustVerifyEmail, status }) {
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Profile" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Profile" }),
        /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-8 bg-white shadow sm:rounded-lg", children: /* @__PURE__ */ jsx(
            UpdateProfileInformation,
            {
              mustVerifyEmail,
              status,
              className: "max-w-xl"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-8 bg-white shadow sm:rounded-lg", children: /* @__PURE__ */ jsx(UpdatePasswordForm, { className: "max-w-xl" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 sm:p-8 bg-white shadow sm:rounded-lg", children: /* @__PURE__ */ jsx(DeleteUserForm, { className: "max-w-xl" }) })
        ] }) })
      ]
    }
  );
}
export {
  Edit as default
};
