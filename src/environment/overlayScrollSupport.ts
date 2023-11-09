import {CHROMIUM_VERSION, IS_CHROMIUM, IS_MOBILE, IS_MOBILE_SAFARI, IS_SAFARI} from './userAgent';

export const USE_NATIVE_SCROLL = /* IS_APPLE ||  */IS_MOBILE/*  || true */;
export const IS_OVERLAY_SCROLL_SUPPORTED = /* true ||  *//* IS_APPLE ||  */IS_MOBILE || (!IS_CHROMIUM && (!IS_SAFARI || IS_MOBILE_SAFARI)) || CHROMIUM_VERSION < 113;
export const USE_CUSTOM_SCROLL = !USE_NATIVE_SCROLL && !IS_OVERLAY_SCROLL_SUPPORTED;