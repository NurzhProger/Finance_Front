import { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "primeng/api";
declare type BadgeDirectiveIconPosition = 'left' | 'right' | 'top' | 'bottom';
export declare class BadgeDirective implements AfterViewInit, OnDestroy {
    el: ElementRef;
    iconPos: BadgeDirectiveIconPosition;
    get disabled(): boolean;
    set disabled(val: boolean);
    _value: string;
    initialized: boolean;
    private id;
    _disabled: boolean;
    constructor(el: ElementRef);
    ngAfterViewInit(): any;
    get value(): string;
    set value(val: string);
    severity: string;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BadgeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BadgeDirective, "[pBadge]", never, { "iconPos": "iconPos"; "disabled": "badgeDisabled"; "value": "value"; "severity": "severity"; }, {}, never, never, false>;
}
export declare class Badge {
    styleClass: string;
    style: any;
    size: string;
    severity: string;
    value: string;
    badgeDisabled: boolean;
    containerClass(): {
        'p-badge p-component': boolean;
        'p-badge-no-gutter': boolean;
        'p-badge-lg': boolean;
        'p-badge-xl': boolean;
        'p-badge-info': boolean;
        'p-badge-success': boolean;
        'p-badge-warning': boolean;
        'p-badge-danger': boolean;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<Badge, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Badge, "p-badge", never, { "styleClass": "styleClass"; "style": "style"; "size": "size"; "severity": "severity"; "value": "value"; "badgeDisabled": "badgeDisabled"; }, {}, never, never, false>;
}
export declare class BadgeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BadgeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BadgeModule, [typeof Badge, typeof BadgeDirective], [typeof i1.CommonModule], [typeof Badge, typeof BadgeDirective, typeof i2.SharedModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BadgeModule>;
}
export {};
