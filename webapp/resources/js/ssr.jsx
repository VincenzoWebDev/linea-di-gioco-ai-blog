import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
import { installRoute, resolvePage, titleCallback } from "./inertiaShared";

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: titleCallback,
        resolve: resolvePage,
        setup({ App, props }) {
            installRoute(props.initialPage.props);

            return <App {...props} />;
        },
    }),
);
