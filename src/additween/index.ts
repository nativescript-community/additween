import type { IStateReducer } from "./PlainObjectReducer";
import type { EasingFunction } from "./AdditiveTweening";
import { PlainObjectReducer } from "./PlainObjectReducer";
import { AdditiveTweening } from "./AdditiveTweening";
import { time } from '@nativescript/core/profiling';

if (!global.window) {
    global.window = {
        requestAnimationFrame,
        cancelAnimationFrame,
        performance: {
            now: time
        }
    } as any;
} else if (!global.window.requestAnimationFrame) {
    global.window.requestAnimationFrame = requestAnimationFrame;
    global.window.cancelAnimationFrame = cancelAnimationFrame;
    if (!global.window.performance) {
        //@ts-ignore
        global.window.performance = {
            now: time
        };
    }
}

export type { EasingFunction, IStateReducer };

export { AdditiveTweening, PlainObjectReducer };
