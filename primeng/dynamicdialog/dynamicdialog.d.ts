import { Type, ComponentFactoryResolver, OnDestroy, ComponentRef, AfterViewInit, ChangeDetectorRef, Renderer2, NgZone, ElementRef } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { DynamicDialogContent } from './dynamicdialogcontent';
import { DynamicDialogConfig } from './dynamicdialog-config';
import { DynamicDialogRef } from './dynamicdialog-ref';
import { PrimeNGConfig } from 'primeng/api';
import * as i0 from "@angular/core";
import * as i1 from "./dynamicdialogcontent";
import * as i2 from "@angular/common";
export declare class DynamicDialogComponent implements AfterViewInit, OnDestroy {
    private componentFactoryResolver;
    private cd;
    renderer: Renderer2;
    config: DynamicDialogConfig;
    private dialogRef;
    zone: NgZone;
    primeNGConfig: PrimeNGConfig;
    visible: boolean;
    componentRef: ComponentRef<any>;
    mask: HTMLDivElement;
    resizing: boolean;
    dragging: boolean;
    maximized: boolean;
    _style: any;
    originalStyle: any;
    lastPageX: number;
    lastPageY: number;
    insertionPoint: DynamicDialogContent;
    maskViewChild: ElementRef;
    contentViewChild: ElementRef;
    headerViewChild: ElementRef;
    childComponentType: Type<any>;
    container: HTMLDivElement;
    wrapper: HTMLElement;
    documentKeydownListener: any;
    documentEscapeListener: Function;
    maskClickListener: Function;
    transformOptions: string;
    documentResizeListener: null;
    documentResizeEndListener: null;
    documentDragListener: null;
    documentDragEndListener: null;
    get minX(): number;
    get minY(): number;
    get keepInViewport(): boolean;
    get maximizable(): boolean;
    get maximizeIcon(): string;
    get minimizeIcon(): string;
    get style(): any;
    get position(): string;
    set style(value: any);
    constructor(componentFactoryResolver: ComponentFactoryResolver, cd: ChangeDetectorRef, renderer: Renderer2, config: DynamicDialogConfig, dialogRef: DynamicDialogRef, zone: NgZone, primeNGConfig: PrimeNGConfig);
    ngAfterViewInit(): void;
    loadChildComponent(componentType: Type<any>): void;
    moveOnTop(): void;
    onAnimationStart(event: AnimationEvent): void;
    onAnimationEnd(event: AnimationEvent): void;
    onContainerDestroy(): void;
    close(): void;
    hide(): void;
    enableModality(): void;
    disableModality(): void;
    onKeydown(event: KeyboardEvent): void;
    focus(): void;
    maximize(): void;
    initResize(event: MouseEvent): void;
    onResize(event: MouseEvent): void;
    resizeEnd(event: MouseEvent): void;
    initDrag(event: MouseEvent): void;
    onDrag(event: MouseEvent): void;
    endDrag(event: MouseEvent): void;
    resetPosition(): void;
    bindDocumentDragListener(): void;
    bindDocumentDragEndListener(): void;
    unbindDocumentDragEndListener(): void;
    unbindDocumentDragListener(): void;
    bindDocumentResizeListeners(): void;
    unbindDocumentResizeListeners(): void;
    bindGlobalListeners(): void;
    unbindGlobalListeners(): void;
    bindDocumentKeydownListener(): void;
    unbindDocumentKeydownListener(): void;
    bindDocumentEscapeListener(): void;
    unbindDocumentEscapeListener(): void;
    unbindMaskClickListener(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DynamicDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DynamicDialogComponent, "p-dynamicDialog", never, {}, {}, never, never, false>;
}
export declare class DynamicDialogModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<DynamicDialogModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<DynamicDialogModule, [typeof DynamicDialogComponent, typeof i1.DynamicDialogContent], [typeof i2.CommonModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<DynamicDialogModule>;
}
