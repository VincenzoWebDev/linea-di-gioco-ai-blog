import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { route as ziggyRoute } from "ziggy-js";

export const appName = import.meta.env.VITE_APP_NAME || "Linea di gioco";

export function titleCallback(title) {
    return `${title} - ${appName}`;
}

export function resolvePage(name) {
    return resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob("./Pages/**/*.jsx"),
    );
}

export function buildZiggyConfig(pageProps = {}) {
    const ziggy = pageProps.ziggy || {};

    return {
        ...ziggy,
        location: ziggy.location ? new URL(ziggy.location) : undefined,
    };
}

export function installRoute(pageProps = {}) {
    const ziggy = buildZiggyConfig(pageProps);

    globalThis.route = (name, params, absolute, config = ziggy) =>
        ziggyRoute(name, params, absolute, config);

    globalThis.Ziggy = ziggy;
}
