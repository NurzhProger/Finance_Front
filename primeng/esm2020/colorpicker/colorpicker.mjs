import { NgModule, Component, Input, Output, EventEmitter, forwardRef, ViewChild, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { DomHandler, ConnectedOverlayScrollHandler } from 'primeng/dom';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZIndexUtils } from 'primeng/utils';
import * as i0 from "@angular/core";
import * as i1 from "primeng/api";
import * as i2 from "@angular/common";
export const COLORPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ColorPicker),
    multi: true
};
export class ColorPicker {
    constructor(el, renderer, cd, config, overlayService) {
        this.el = el;
        this.renderer = renderer;
        this.cd = cd;
        this.config = config;
        this.overlayService = overlayService;
        this.format = 'hex';
        this.autoZIndex = true;
        this.baseZIndex = 0;
        this.showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
        this.hideTransitionOptions = '.1s linear';
        this.onChange = new EventEmitter();
        this.onShow = new EventEmitter();
        this.onHide = new EventEmitter();
        this.value = { h: 0, s: 100, b: 100 };
        this.defaultColor = 'ff0000';
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
    }
    set colorSelector(element) {
        this.colorSelectorViewChild = element;
    }
    set colorHandle(element) {
        this.colorHandleViewChild = element;
    }
    set hue(element) {
        this.hueViewChild = element;
    }
    set hueHandle(element) {
        this.hueHandleViewChild = element;
    }
    onHueMousedown(event) {
        if (this.disabled) {
            return;
        }
        this.bindDocumentMousemoveListener();
        this.bindDocumentMouseupListener();
        this.hueDragging = true;
        this.pickHue(event);
    }
    onHueTouchStart(event) {
        if (this.disabled) {
            return;
        }
        this.hueDragging = true;
        this.pickHue(event, event.changedTouches[0]);
    }
    onColorTouchStart(event) {
        if (this.disabled) {
            return;
        }
        this.colorDragging = true;
        this.pickColor(event, event.changedTouches[0]);
    }
    pickHue(event, position) {
        let pageY = position ? position.pageY : event.pageY;
        let top = this.hueViewChild.nativeElement.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
        this.value = this.validateHSB({
            h: Math.floor((360 * (150 - Math.max(0, Math.min(150, pageY - top)))) / 150),
            s: this.value.s,
            b: this.value.b
        });
        this.updateColorSelector();
        this.updateUI();
        this.updateModel();
        this.onChange.emit({ originalEvent: event, value: this.getValueToUpdate() });
    }
    onColorMousedown(event) {
        if (this.disabled) {
            return;
        }
        this.bindDocumentMousemoveListener();
        this.bindDocumentMouseupListener();
        this.colorDragging = true;
        this.pickColor(event);
    }
    onMove(event) {
        if (this.colorDragging) {
            this.pickColor(event, event.changedTouches[0]);
            event.preventDefault();
        }
        if (this.hueDragging) {
            this.pickHue(event, event.changedTouches[0]);
            event.preventDefault();
        }
    }
    onDragEnd() {
        this.colorDragging = false;
        this.hueDragging = false;
        this.unbindDocumentMousemoveListener();
        this.unbindDocumentMouseupListener();
    }
    pickColor(event, position) {
        let pageX = position ? position.pageX : event.pageX;
        let pageY = position ? position.pageY : event.pageY;
        let rect = this.colorSelectorViewChild.nativeElement.getBoundingClientRect();
        let top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
        let left = rect.left + document.body.scrollLeft;
        let saturation = Math.floor((100 * Math.max(0, Math.min(150, pageX - left))) / 150);
        let brightness = Math.floor((100 * (150 - Math.max(0, Math.min(150, pageY - top)))) / 150);
        this.value = this.validateHSB({
            h: this.value.h,
            s: saturation,
            b: brightness
        });
        this.updateUI();
        this.updateModel();
        this.onChange.emit({ originalEvent: event, value: this.getValueToUpdate() });
    }
    getValueToUpdate() {
        let val;
        switch (this.format) {
            case 'hex':
                val = '#' + this.HSBtoHEX(this.value);
                break;
            case 'rgb':
                val = this.HSBtoRGB(this.value);
                break;
            case 'hsb':
                val = this.value;
                break;
        }
        return val;
    }
    updateModel() {
        this.onModelChange(this.getValueToUpdate());
    }
    writeValue(value) {
        if (value) {
            switch (this.format) {
                case 'hex':
                    this.value = this.HEXtoHSB(value);
                    break;
                case 'rgb':
                    this.value = this.RGBtoHSB(value);
                    break;
                case 'hsb':
                    this.value = value;
                    break;
            }
        }
        else {
            this.value = this.HEXtoHSB(this.defaultColor);
        }
        this.updateColorSelector();
        this.updateUI();
        this.cd.markForCheck();
    }
    updateColorSelector() {
        if (this.colorSelectorViewChild) {
            const hsb = {};
            hsb.s = 100;
            hsb.b = 100;
            hsb.h = this.value.h;
            this.colorSelectorViewChild.nativeElement.style.backgroundColor = '#' + this.HSBtoHEX(hsb);
        }
    }
    updateUI() {
        if (this.colorHandleViewChild && this.hueHandleViewChild.nativeElement) {
            this.colorHandleViewChild.nativeElement.style.left = Math.floor((150 * this.value.s) / 100) + 'px';
            this.colorHandleViewChild.nativeElement.style.top = Math.floor((150 * (100 - this.value.b)) / 100) + 'px';
            this.hueHandleViewChild.nativeElement.style.top = Math.floor(150 - (150 * this.value.h) / 360) + 'px';
        }
        this.inputBgColor = '#' + this.HSBtoHEX(this.value);
    }
    onInputFocus() {
        this.onModelTouched();
    }
    show() {
        this.overlayVisible = true;
        this.cd.markForCheck();
    }
    onOverlayAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                if (!this.inline) {
                    this.overlay = event.element;
                    this.appendOverlay();
                    if (this.autoZIndex) {
                        ZIndexUtils.set('overlay', this.overlay, this.config.zIndex.overlay);
                    }
                    this.alignOverlay();
                    this.bindDocumentClickListener();
                    this.bindDocumentResizeListener();
                    this.bindScrollListener();
                    this.updateColorSelector();
                    this.updateUI();
                }
                break;
            case 'void':
                this.onOverlayHide();
                break;
        }
    }
    onOverlayAnimationEnd(event) {
        switch (event.toState) {
            case 'visible':
                if (!this.inline) {
                    this.onShow.emit({});
                }
                break;
            case 'void':
                if (this.autoZIndex) {
                    ZIndexUtils.clear(event.element);
                }
                this.onHide.emit({});
                break;
        }
    }
    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.overlay);
            else
                DomHandler.appendChild(this.overlay, this.appendTo);
        }
    }
    restoreOverlayAppend() {
        if (this.overlay && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlay);
        }
    }
    alignOverlay() {
        if (this.appendTo)
            DomHandler.absolutePosition(this.overlay, this.inputViewChild.nativeElement);
        else
            DomHandler.relativePosition(this.overlay, this.inputViewChild.nativeElement);
    }
    hide() {
        this.overlayVisible = false;
        this.cd.markForCheck();
    }
    onInputClick() {
        this.selfClick = true;
        this.togglePanel();
    }
    togglePanel() {
        if (!this.overlayVisible)
            this.show();
        else
            this.hide();
    }
    onInputKeydown(event) {
        switch (event.which) {
            //space
            case 32:
                this.togglePanel();
                event.preventDefault();
                break;
            //escape and tab
            case 27:
            case 9:
                this.hide();
                break;
        }
    }
    onOverlayClick(event) {
        this.overlayService.add({
            originalEvent: event,
            target: this.el.nativeElement
        });
        this.selfClick = true;
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    setDisabledState(val) {
        this.disabled = val;
        this.cd.markForCheck();
    }
    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentClickListener = this.renderer.listen(documentTarget, 'click', () => {
                if (!this.selfClick) {
                    this.overlayVisible = false;
                    this.unbindDocumentClickListener();
                }
                this.selfClick = false;
                this.cd.markForCheck();
            });
        }
    }
    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }
    bindDocumentMousemoveListener() {
        if (!this.documentMousemoveListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentMousemoveListener = this.renderer.listen(documentTarget, 'mousemove', (event) => {
                if (this.colorDragging) {
                    this.pickColor(event);
                }
                if (this.hueDragging) {
                    this.pickHue(event);
                }
            });
        }
    }
    unbindDocumentMousemoveListener() {
        if (this.documentMousemoveListener) {
            this.documentMousemoveListener();
            this.documentMousemoveListener = null;
        }
    }
    bindDocumentMouseupListener() {
        if (!this.documentMouseupListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentMouseupListener = this.renderer.listen(documentTarget, 'mouseup', () => {
                this.colorDragging = false;
                this.hueDragging = false;
                this.unbindDocumentMousemoveListener();
                this.unbindDocumentMouseupListener();
            });
        }
    }
    unbindDocumentMouseupListener() {
        if (this.documentMouseupListener) {
            this.documentMouseupListener();
            this.documentMouseupListener = null;
        }
    }
    bindDocumentResizeListener() {
        this.documentResizeListener = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.documentResizeListener);
    }
    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
    onWindowResize() {
        if (this.overlayVisible && !DomHandler.isTouchDevice()) {
            this.hide();
        }
    }
    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.containerViewChild.nativeElement, () => {
                if (this.overlayVisible) {
                    this.hide();
                }
            });
        }
        this.scrollHandler.bindScrollListener();
    }
    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }
    validateHSB(hsb) {
        return {
            h: Math.min(360, Math.max(0, hsb.h)),
            s: Math.min(100, Math.max(0, hsb.s)),
            b: Math.min(100, Math.max(0, hsb.b))
        };
    }
    validateRGB(rgb) {
        return {
            r: Math.min(255, Math.max(0, rgb.r)),
            g: Math.min(255, Math.max(0, rgb.g)),
            b: Math.min(255, Math.max(0, rgb.b))
        };
    }
    validateHEX(hex) {
        var len = 6 - hex.length;
        if (len > 0) {
            var o = [];
            for (var i = 0; i < len; i++) {
                o.push('0');
            }
            o.push(hex);
            hex = o.join('');
        }
        return hex;
    }
    HEXtoRGB(hex) {
        let hexValue = parseInt(hex.indexOf('#') > -1 ? hex.substring(1) : hex, 16);
        return { r: hexValue >> 16, g: (hexValue & 0x00ff00) >> 8, b: hexValue & 0x0000ff };
    }
    HEXtoHSB(hex) {
        return this.RGBtoHSB(this.HEXtoRGB(hex));
    }
    RGBtoHSB(rgb) {
        var hsb = {
            h: 0,
            s: 0,
            b: 0
        };
        var min = Math.min(rgb.r, rgb.g, rgb.b);
        var max = Math.max(rgb.r, rgb.g, rgb.b);
        var delta = max - min;
        hsb.b = max;
        hsb.s = max != 0 ? (255 * delta) / max : 0;
        if (hsb.s != 0) {
            if (rgb.r == max) {
                hsb.h = (rgb.g - rgb.b) / delta;
            }
            else if (rgb.g == max) {
                hsb.h = 2 + (rgb.b - rgb.r) / delta;
            }
            else {
                hsb.h = 4 + (rgb.r - rgb.g) / delta;
            }
        }
        else {
            hsb.h = -1;
        }
        hsb.h *= 60;
        if (hsb.h < 0) {
            hsb.h += 360;
        }
        hsb.s *= 100 / 255;
        hsb.b *= 100 / 255;
        return hsb;
    }
    HSBtoRGB(hsb) {
        var rgb = {
            r: null,
            g: null,
            b: null
        };
        let h = hsb.h;
        let s = (hsb.s * 255) / 100;
        let v = (hsb.b * 255) / 100;
        if (s == 0) {
            rgb = {
                r: v,
                g: v,
                b: v
            };
        }
        else {
            let t1 = v;
            let t2 = ((255 - s) * v) / 255;
            let t3 = ((t1 - t2) * (h % 60)) / 60;
            if (h == 360)
                h = 0;
            if (h < 60) {
                rgb.r = t1;
                rgb.b = t2;
                rgb.g = t2 + t3;
            }
            else if (h < 120) {
                rgb.g = t1;
                rgb.b = t2;
                rgb.r = t1 - t3;
            }
            else if (h < 180) {
                rgb.g = t1;
                rgb.r = t2;
                rgb.b = t2 + t3;
            }
            else if (h < 240) {
                rgb.b = t1;
                rgb.r = t2;
                rgb.g = t1 - t3;
            }
            else if (h < 300) {
                rgb.b = t1;
                rgb.g = t2;
                rgb.r = t2 + t3;
            }
            else if (h < 360) {
                rgb.r = t1;
                rgb.g = t2;
                rgb.b = t1 - t3;
            }
            else {
                rgb.r = 0;
                rgb.g = 0;
                rgb.b = 0;
            }
        }
        return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
    }
    RGBtoHEX(rgb) {
        var hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
        for (var key in hex) {
            if (hex[key].length == 1) {
                hex[key] = '0' + hex[key];
            }
        }
        return hex.join('');
    }
    HSBtoHEX(hsb) {
        return this.RGBtoHEX(this.HSBtoRGB(hsb));
    }
    onOverlayHide() {
        this.unbindScrollListener();
        this.unbindDocumentResizeListener();
        this.unbindDocumentClickListener();
        this.overlay = null;
    }
    ngOnDestroy() {
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }
        if (this.overlay && this.autoZIndex) {
            ZIndexUtils.clear(this.overlay);
        }
        this.restoreOverlayAppend();
        this.onOverlayHide();
    }
}
ColorPicker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: ColorPicker, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.ChangeDetectorRef }, { token: i1.PrimeNGConfig }, { token: i1.OverlayService }], target: i0.ɵɵFactoryTarget.Component });
ColorPicker.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.7", type: ColorPicker, selector: "p-colorPicker", inputs: { style: "style", styleClass: "styleClass", inline: "inline", format: "format", appendTo: "appendTo", disabled: "disabled", tabindex: "tabindex", inputId: "inputId", autoZIndex: "autoZIndex", baseZIndex: "baseZIndex", showTransitionOptions: "showTransitionOptions", hideTransitionOptions: "hideTransitionOptions" }, outputs: { onChange: "onChange", onShow: "onShow", onHide: "onHide" }, host: { classAttribute: "p-element" }, providers: [COLORPICKER_VALUE_ACCESSOR], viewQueries: [{ propertyName: "containerViewChild", first: true, predicate: ["container"], descendants: true }, { propertyName: "inputViewChild", first: true, predicate: ["input"], descendants: true }, { propertyName: "colorSelector", first: true, predicate: ["colorSelector"], descendants: true }, { propertyName: "colorHandle", first: true, predicate: ["colorHandle"], descendants: true }, { propertyName: "hue", first: true, predicate: ["hue"], descendants: true }, { propertyName: "hueHandle", first: true, predicate: ["hueHandle"], descendants: true }], ngImport: i0, template: `
        <div #container [ngStyle]="style" [class]="styleClass" [ngClass]="{ 'p-colorpicker p-component': true, 'p-colorpicker-overlay': !inline, 'p-colorpicker-dragging': colorDragging || hueDragging }">
            <input
                #input
                type="text"
                *ngIf="!inline"
                class="p-colorpicker-preview p-inputtext"
                readonly="readonly"
                [ngClass]="{ 'p-disabled': disabled }"
                (focus)="onInputFocus()"
                (click)="onInputClick()"
                (keydown)="onInputKeydown($event)"
                [attr.id]="inputId"
                [attr.tabindex]="tabindex"
                [disabled]="disabled"
                [style.backgroundColor]="inputBgColor"
            />
            <div
                *ngIf="inline || overlayVisible"
                [ngClass]="{ 'p-colorpicker-panel': true, 'p-colorpicker-overlay-panel': !inline, 'p-disabled': disabled }"
                (click)="onOverlayClick($event)"
                [@overlayAnimation]="{ value: 'visible', params: { showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions } }"
                [@.disabled]="inline === true"
                (@overlayAnimation.start)="onOverlayAnimationStart($event)"
                (@overlayAnimation.done)="onOverlayAnimationEnd($event)"
            >
                <div class="p-colorpicker-content">
                    <div #colorSelector class="p-colorpicker-color-selector" (touchstart)="onColorTouchStart($event)" (touchmove)="onMove($event)" (touchend)="onDragEnd()" (mousedown)="onColorMousedown($event)">
                        <div class="p-colorpicker-color">
                            <div #colorHandle class="p-colorpicker-color-handle"></div>
                        </div>
                    </div>
                    <div #hue class="p-colorpicker-hue" (mousedown)="onHueMousedown($event)" (touchstart)="onHueTouchStart($event)" (touchmove)="onMove($event)" (touchend)="onDragEnd()">
                        <div #hueHandle class="p-colorpicker-hue-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    `, isInline: true, styles: [".p-colorpicker{display:inline-block}.p-colorpicker-dragging{cursor:pointer}.p-colorpicker-overlay{position:relative}.p-colorpicker-panel{position:relative;width:193px;height:166px}.p-colorpicker-overlay-panel{position:absolute;top:0;left:0}.p-colorpicker-preview{cursor:pointer}.p-colorpicker-panel .p-colorpicker-content{position:relative}.p-colorpicker-panel .p-colorpicker-color-selector{width:150px;height:150px;top:8px;left:8px;position:absolute}.p-colorpicker-panel .p-colorpicker-color{width:150px;height:150px}.p-colorpicker-panel .p-colorpicker-color-handle{position:absolute;top:0;left:150px;border-radius:100%;width:10px;height:10px;border-width:1px;border-style:solid;margin:-5px 0 0 -5px;cursor:pointer;opacity:.85}.p-colorpicker-panel .p-colorpicker-hue{width:17px;height:150px;top:8px;left:167px;position:absolute;opacity:.85}.p-colorpicker-panel .p-colorpicker-hue-handle{position:absolute;top:150px;left:0;width:21px;margin-left:-2px;margin-top:-5px;height:10px;border-width:2px;border-style:solid;opacity:.85;cursor:pointer}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]), transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])])], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: ColorPicker, decorators: [{
            type: Component,
            args: [{ selector: 'p-colorPicker', template: `
        <div #container [ngStyle]="style" [class]="styleClass" [ngClass]="{ 'p-colorpicker p-component': true, 'p-colorpicker-overlay': !inline, 'p-colorpicker-dragging': colorDragging || hueDragging }">
            <input
                #input
                type="text"
                *ngIf="!inline"
                class="p-colorpicker-preview p-inputtext"
                readonly="readonly"
                [ngClass]="{ 'p-disabled': disabled }"
                (focus)="onInputFocus()"
                (click)="onInputClick()"
                (keydown)="onInputKeydown($event)"
                [attr.id]="inputId"
                [attr.tabindex]="tabindex"
                [disabled]="disabled"
                [style.backgroundColor]="inputBgColor"
            />
            <div
                *ngIf="inline || overlayVisible"
                [ngClass]="{ 'p-colorpicker-panel': true, 'p-colorpicker-overlay-panel': !inline, 'p-disabled': disabled }"
                (click)="onOverlayClick($event)"
                [@overlayAnimation]="{ value: 'visible', params: { showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions } }"
                [@.disabled]="inline === true"
                (@overlayAnimation.start)="onOverlayAnimationStart($event)"
                (@overlayAnimation.done)="onOverlayAnimationEnd($event)"
            >
                <div class="p-colorpicker-content">
                    <div #colorSelector class="p-colorpicker-color-selector" (touchstart)="onColorTouchStart($event)" (touchmove)="onMove($event)" (touchend)="onDragEnd()" (mousedown)="onColorMousedown($event)">
                        <div class="p-colorpicker-color">
                            <div #colorHandle class="p-colorpicker-color-handle"></div>
                        </div>
                    </div>
                    <div #hue class="p-colorpicker-hue" (mousedown)="onHueMousedown($event)" (touchstart)="onHueTouchStart($event)" (touchmove)="onMove($event)" (touchend)="onDragEnd()">
                        <div #hueHandle class="p-colorpicker-hue-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    `, animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]), transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])])], providers: [COLORPICKER_VALUE_ACCESSOR], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, host: {
                        class: 'p-element'
                    }, styles: [".p-colorpicker{display:inline-block}.p-colorpicker-dragging{cursor:pointer}.p-colorpicker-overlay{position:relative}.p-colorpicker-panel{position:relative;width:193px;height:166px}.p-colorpicker-overlay-panel{position:absolute;top:0;left:0}.p-colorpicker-preview{cursor:pointer}.p-colorpicker-panel .p-colorpicker-content{position:relative}.p-colorpicker-panel .p-colorpicker-color-selector{width:150px;height:150px;top:8px;left:8px;position:absolute}.p-colorpicker-panel .p-colorpicker-color{width:150px;height:150px}.p-colorpicker-panel .p-colorpicker-color-handle{position:absolute;top:0;left:150px;border-radius:100%;width:10px;height:10px;border-width:1px;border-style:solid;margin:-5px 0 0 -5px;cursor:pointer;opacity:.85}.p-colorpicker-panel .p-colorpicker-hue{width:17px;height:150px;top:8px;left:167px;position:absolute;opacity:.85}.p-colorpicker-panel .p-colorpicker-hue-handle{position:absolute;top:150px;left:0;width:21px;margin-left:-2px;margin-top:-5px;height:10px;border-width:2px;border-style:solid;opacity:.85;cursor:pointer}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.ChangeDetectorRef }, { type: i1.PrimeNGConfig }, { type: i1.OverlayService }]; }, propDecorators: { style: [{
                type: Input
            }], styleClass: [{
                type: Input
            }], inline: [{
                type: Input
            }], format: [{
                type: Input
            }], appendTo: [{
                type: Input
            }], disabled: [{
                type: Input
            }], tabindex: [{
                type: Input
            }], inputId: [{
                type: Input
            }], autoZIndex: [{
                type: Input
            }], baseZIndex: [{
                type: Input
            }], showTransitionOptions: [{
                type: Input
            }], hideTransitionOptions: [{
                type: Input
            }], onChange: [{
                type: Output
            }], onShow: [{
                type: Output
            }], onHide: [{
                type: Output
            }], containerViewChild: [{
                type: ViewChild,
                args: ['container']
            }], inputViewChild: [{
                type: ViewChild,
                args: ['input']
            }], colorSelector: [{
                type: ViewChild,
                args: ['colorSelector']
            }], colorHandle: [{
                type: ViewChild,
                args: ['colorHandle']
            }], hue: [{
                type: ViewChild,
                args: ['hue']
            }], hueHandle: [{
                type: ViewChild,
                args: ['hueHandle']
            }] } });
export class ColorPickerModule {
}
ColorPickerModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: ColorPickerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
ColorPickerModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.0.7", ngImport: i0, type: ColorPickerModule, declarations: [ColorPicker], imports: [CommonModule], exports: [ColorPicker] });
ColorPickerModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: ColorPickerModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: ColorPickerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    exports: [ColorPicker],
                    declarations: [ColorPicker]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JwaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvY29sb3JwaWNrZXIvY29sb3JwaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQWMsS0FBSyxFQUFFLE1BQU0sRUFBYSxZQUFZLEVBQUUsVUFBVSxFQUFhLFNBQVMsRUFBcUIsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDek0sT0FBTyxFQUFFLE9BQU8sRUFBUyxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFVBQVUsRUFBRSw2QkFBNkIsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQXdCLE1BQU0sZ0JBQWdCLENBQUM7QUFFekUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQUU1QyxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBUTtJQUMzQyxPQUFPLEVBQUUsaUJBQWlCO0lBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO0lBQzFDLEtBQUssRUFBRSxJQUFJO0NBQ2QsQ0FBQztBQW9ERixNQUFNLE9BQU8sV0FBVztJQTZFcEIsWUFBbUIsRUFBYyxFQUFTLFFBQW1CLEVBQVMsRUFBcUIsRUFBUyxNQUFxQixFQUFTLGNBQThCO1FBQTdJLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQVMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBdEV2SixXQUFNLEdBQVcsS0FB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R0FBVyxDQUFDLENBQUM7WUFDbkIsSUFBSSxFQUFFLEdBQVcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7WUFDdkMsSUFBSSxFQUFFLEdBQVcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHO2dCQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNSLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNuQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUU7Z0JBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNuQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUU7Z0JBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNuQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUU7Z0JBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNuQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUU7Z0JBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNuQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUU7Z0JBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUNuQjtpQkFBTTtnQkFDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDVixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDVixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNiO1NBQ0o7UUFDRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNoRixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQUc7UUFDUixJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdkUsS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7WUFDakIsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDN0I7U0FDSjtRQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQUc7UUFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxhQUFhO1FBQ1QsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztTQUM3QjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ25DO1FBRUQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7O3dHQW5vQlEsV0FBVzs0RkFBWCxXQUFXLDBkQVJULENBQUMsMEJBQTBCLENBQUMseWtCQXhDN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBc0NULHUyQ0FDVyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzsyRkFTcE8sV0FBVztrQkFsRHZCLFNBQVM7K0JBQ0ksZUFBZSxZQUNmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXNDVCxjQUNXLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQ2xPLENBQUMsMEJBQTBCLENBQUMsbUJBQ3RCLHVCQUF1QixDQUFDLE1BQU0saUJBQ2hDLGlCQUFpQixDQUFDLElBQUksUUFFL0I7d0JBQ0YsS0FBSyxFQUFFLFdBQVc7cUJBQ3JCO2tOQUdRLEtBQUs7c0JBQWIsS0FBSztnQkFFRyxVQUFVO3NCQUFsQixLQUFLO2dCQUVHLE1BQU07c0JBQWQsS0FBSztnQkFFRyxNQUFNO3NCQUFkLEtBQUs7Z0JBRUcsUUFBUTtzQkFBaEIsS0FBSztnQkFFRyxRQUFRO3NCQUFoQixLQUFLO2dCQUVHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBRUcsT0FBTztzQkFBZixLQUFLO2dCQUVHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBRUcsVUFBVTtzQkFBbEIsS0FBSztnQkFFRyxxQkFBcUI7c0JBQTdCLEtBQUs7Z0JBRUcscUJBQXFCO3NCQUE3QixLQUFLO2dCQUVJLFFBQVE7c0JBQWpCLE1BQU07Z0JBRUcsTUFBTTtzQkFBZixNQUFNO2dCQUVHLE1BQU07c0JBQWYsTUFBTTtnQkFFaUIsa0JBQWtCO3NCQUF6QyxTQUFTO3VCQUFDLFdBQVc7Z0JBRUYsY0FBYztzQkFBakMsU0FBUzt1QkFBQyxPQUFPO2dCQThDYyxhQUFhO3NCQUE1QyxTQUFTO3VCQUFDLGVBQWU7Z0JBSUksV0FBVztzQkFBeEMsU0FBUzt1QkFBQyxhQUFhO2dCQUlGLEdBQUc7c0JBQXhCLFNBQVM7dUJBQUMsS0FBSztnQkFJWSxTQUFTO3NCQUFwQyxTQUFTO3VCQUFDLFdBQVc7O0FBZ2pCMUIsTUFBTSxPQUFPLGlCQUFpQjs7OEdBQWpCLGlCQUFpQjsrR0FBakIsaUJBQWlCLGlCQTNvQmpCLFdBQVcsYUF1b0JWLFlBQVksYUF2b0JiLFdBQVc7K0dBMm9CWCxpQkFBaUIsWUFKaEIsWUFBWTsyRkFJYixpQkFBaUI7a0JBTDdCLFFBQVE7bUJBQUM7b0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUN2QixPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7b0JBQ3RCLFlBQVksRUFBRSxDQUFDLFdBQVcsQ0FBQztpQkFDOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT3V0cHV0LCBPbkRlc3Ryb3ksIEV2ZW50RW1pdHRlciwgZm9yd2FyZFJlZiwgUmVuZGVyZXIyLCBWaWV3Q2hpbGQsIENoYW5nZURldGVjdG9yUmVmLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IHRyaWdnZXIsIHN0YXRlLCBzdHlsZSwgdHJhbnNpdGlvbiwgYW5pbWF0ZSwgQW5pbWF0aW9uRXZlbnQgfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBEb21IYW5kbGVyLCBDb25uZWN0ZWRPdmVybGF5U2Nyb2xsSGFuZGxlciB9IGZyb20gJ3ByaW1lbmcvZG9tJztcbmltcG9ydCB7IE5HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3NvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE92ZXJsYXlTZXJ2aWNlLCBQcmltZU5HQ29uZmlnIH0gZnJvbSAncHJpbWVuZy9hcGknO1xuaW1wb3J0IHsgWkluZGV4VXRpbHMgfSBmcm9tICdwcmltZW5nL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IENPTE9SUElDS0VSX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XG4gICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ29sb3JQaWNrZXIpLFxuICAgIG11bHRpOiB0cnVlXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3AtY29sb3JQaWNrZXInLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxkaXYgI2NvbnRhaW5lciBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCIgW25nQ2xhc3NdPVwieyAncC1jb2xvcnBpY2tlciBwLWNvbXBvbmVudCc6IHRydWUsICdwLWNvbG9ycGlja2VyLW92ZXJsYXknOiAhaW5saW5lLCAncC1jb2xvcnBpY2tlci1kcmFnZ2luZyc6IGNvbG9yRHJhZ2dpbmcgfHwgaHVlRHJhZ2dpbmcgfVwiPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgI2lucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICpuZ0lmPVwiIWlubGluZVwiXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJwLWNvbG9ycGlja2VyLXByZXZpZXcgcC1pbnB1dHRleHRcIlxuICAgICAgICAgICAgICAgIHJlYWRvbmx5PVwicmVhZG9ubHlcIlxuICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsgJ3AtZGlzYWJsZWQnOiBkaXNhYmxlZCB9XCJcbiAgICAgICAgICAgICAgICAoZm9jdXMpPVwib25JbnB1dEZvY3VzKClcIlxuICAgICAgICAgICAgICAgIChjbGljayk9XCJvbklucHV0Q2xpY2soKVwiXG4gICAgICAgICAgICAgICAgKGtleWRvd24pPVwib25JbnB1dEtleWRvd24oJGV2ZW50KVwiXG4gICAgICAgICAgICAgICAgW2F0dHIuaWRdPVwiaW5wdXRJZFwiXG4gICAgICAgICAgICAgICAgW2F0dHIudGFiaW5kZXhdPVwidGFiaW5kZXhcIlxuICAgICAgICAgICAgICAgIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiXG4gICAgICAgICAgICAgICAgW3N0eWxlLmJhY2tncm91bmRDb2xvcl09XCJpbnB1dEJnQ29sb3JcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAqbmdJZj1cImlubGluZSB8fCBvdmVybGF5VmlzaWJsZVwiXG4gICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwieyAncC1jb2xvcnBpY2tlci1wYW5lbCc6IHRydWUsICdwLWNvbG9ycGlja2VyLW92ZXJsYXktcGFuZWwnOiAhaW5saW5lLCAncC1kaXNhYmxlZCc6IGRpc2FibGVkIH1cIlxuICAgICAgICAgICAgICAgIChjbGljayk9XCJvbk92ZXJsYXlDbGljaygkZXZlbnQpXCJcbiAgICAgICAgICAgICAgICBbQG92ZXJsYXlBbmltYXRpb25dPVwieyB2YWx1ZTogJ3Zpc2libGUnLCBwYXJhbXM6IHsgc2hvd1RyYW5zaXRpb25QYXJhbXM6IHNob3dUcmFuc2l0aW9uT3B0aW9ucywgaGlkZVRyYW5zaXRpb25QYXJhbXM6IGhpZGVUcmFuc2l0aW9uT3B0aW9ucyB9IH1cIlxuICAgICAgICAgICAgICAgIFtALmRpc2FibGVkXT1cImlubGluZSA9PT0gdHJ1ZVwiXG4gICAgICAgICAgICAgICAgKEBvdmVybGF5QW5pbWF0aW9uLnN0YXJ0KT1cIm9uT3ZlcmxheUFuaW1hdGlvblN0YXJ0KCRldmVudClcIlxuICAgICAgICAgICAgICAgIChAb3ZlcmxheUFuaW1hdGlvbi5kb25lKT1cIm9uT3ZlcmxheUFuaW1hdGlvbkVuZCgkZXZlbnQpXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1jb2xvcnBpY2tlci1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgI2NvbG9yU2VsZWN0b3IgY2xhc3M9XCJwLWNvbG9ycGlja2VyLWNvbG9yLXNlbGVjdG9yXCIgKHRvdWNoc3RhcnQpPVwib25Db2xvclRvdWNoU3RhcnQoJGV2ZW50KVwiICh0b3VjaG1vdmUpPVwib25Nb3ZlKCRldmVudClcIiAodG91Y2hlbmQpPVwib25EcmFnRW5kKClcIiAobW91c2Vkb3duKT1cIm9uQ29sb3JNb3VzZWRvd24oJGV2ZW50KVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtY29sb3JwaWNrZXItY29sb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2ICNjb2xvckhhbmRsZSBjbGFzcz1cInAtY29sb3JwaWNrZXItY29sb3ItaGFuZGxlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgI2h1ZSBjbGFzcz1cInAtY29sb3JwaWNrZXItaHVlXCIgKG1vdXNlZG93bik9XCJvbkh1ZU1vdXNlZG93bigkZXZlbnQpXCIgKHRvdWNoc3RhcnQpPVwib25IdWVUb3VjaFN0YXJ0KCRldmVudClcIiAodG91Y2htb3ZlKT1cIm9uTW92ZSgkZXZlbnQpXCIgKHRvdWNoZW5kKT1cIm9uRHJhZ0VuZCgpXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2ICNodWVIYW5kbGUgY2xhc3M9XCJwLWNvbG9ycGlja2VyLWh1ZS1oYW5kbGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBhbmltYXRpb25zOiBbdHJpZ2dlcignb3ZlcmxheUFuaW1hdGlvbicsIFt0cmFuc2l0aW9uKCc6ZW50ZXInLCBbc3R5bGUoeyBvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZVkoMC44KScgfSksIGFuaW1hdGUoJ3t7c2hvd1RyYW5zaXRpb25QYXJhbXN9fScpXSksIHRyYW5zaXRpb24oJzpsZWF2ZScsIFthbmltYXRlKCd7e2hpZGVUcmFuc2l0aW9uUGFyYW1zfX0nLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXSldKV0sXG4gICAgcHJvdmlkZXJzOiBbQ09MT1JQSUNLRVJfVkFMVUVfQUNDRVNTT1JdLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gICAgc3R5bGVVcmxzOiBbJy4vY29sb3JwaWNrZXIuY3NzJ10sXG4gICAgaG9zdDoge1xuICAgICAgICBjbGFzczogJ3AtZWxlbWVudCdcbiAgICB9XG59KVxuZXhwb3J0IGNsYXNzIENvbG9yUGlja2VyIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uRGVzdHJveSB7XG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcblxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIGlubGluZTogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpIGZvcm1hdDogc3RyaW5nID0gJ2hleCc7XG5cbiAgICBASW5wdXQoKSBhcHBlbmRUbzogYW55O1xuXG4gICAgQElucHV0KCkgZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSB0YWJpbmRleDogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgaW5wdXRJZDogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgYXV0b1pJbmRleDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSBiYXNlWkluZGV4OiBudW1iZXIgPSAwO1xuXG4gICAgQElucHV0KCkgc2hvd1RyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnLjEycyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKSc7XG5cbiAgICBASW5wdXQoKSBoaWRlVHJhbnNpdGlvbk9wdGlvbnM6IHN0cmluZyA9ICcuMXMgbGluZWFyJztcblxuICAgIEBPdXRwdXQoKSBvbkNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KCkgb25TaG93OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKSBvbkhpZGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQFZpZXdDaGlsZCgnY29udGFpbmVyJykgY29udGFpbmVyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xuXG4gICAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dFZpZXdDaGlsZDogRWxlbWVudFJlZjtcblxuICAgIHZhbHVlOiBhbnkgPSB7IGg6IDAsIHM6IDEwMCwgYjogMTAwIH07XG5cbiAgICBpbnB1dEJnQ29sb3I6IHN0cmluZztcblxuICAgIHNob3duOiBib29sZWFuO1xuXG4gICAgb3ZlcmxheVZpc2libGU6IGJvb2xlYW47XG5cbiAgICBkZWZhdWx0Q29sb3I6IHN0cmluZyA9ICdmZjAwMDAnO1xuXG4gICAgb25Nb2RlbENoYW5nZTogRnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuICAgIG9uTW9kZWxUb3VjaGVkOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4gICAgZG9jdW1lbnRDbGlja0xpc3RlbmVyOiBGdW5jdGlvbjtcblxuICAgIGRvY3VtZW50UmVzaXplTGlzdGVuZXI6IGFueTtcblxuICAgIGRvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXI6IEZ1bmN0aW9uO1xuXG4gICAgZG9jdW1lbnRNb3VzZXVwTGlzdGVuZXI6IEZ1bmN0aW9uO1xuXG4gICAgZG9jdW1lbnRIdWVNb3ZlTGlzdGVuZXI6IEZ1bmN0aW9uO1xuXG4gICAgc2Nyb2xsSGFuZGxlcjogYW55O1xuXG4gICAgc2VsZkNsaWNrOiBib29sZWFuO1xuXG4gICAgY29sb3JEcmFnZ2luZzogYm9vbGVhbjtcblxuICAgIGh1ZURyYWdnaW5nOiBib29sZWFuO1xuXG4gICAgb3ZlcmxheTogSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBjb2xvclNlbGVjdG9yVmlld0NoaWxkOiBFbGVtZW50UmVmO1xuXG4gICAgY29sb3JIYW5kbGVWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XG5cbiAgICBodWVWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XG5cbiAgICBodWVIYW5kbGVWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsIHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXIyLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwdWJsaWMgY29uZmlnOiBQcmltZU5HQ29uZmlnLCBwdWJsaWMgb3ZlcmxheVNlcnZpY2U6IE92ZXJsYXlTZXJ2aWNlKSB7fVxuXG4gICAgQFZpZXdDaGlsZCgnY29sb3JTZWxlY3RvcicpIHNldCBjb2xvclNlbGVjdG9yKGVsZW1lbnQ6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgdGhpcy5jb2xvclNlbGVjdG9yVmlld0NoaWxkID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBAVmlld0NoaWxkKCdjb2xvckhhbmRsZScpIHNldCBjb2xvckhhbmRsZShlbGVtZW50OiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuY29sb3JIYW5kbGVWaWV3Q2hpbGQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIEBWaWV3Q2hpbGQoJ2h1ZScpIHNldCBodWUoZWxlbWVudDogRWxlbWVudFJlZikge1xuICAgICAgICB0aGlzLmh1ZVZpZXdDaGlsZCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgQFZpZXdDaGlsZCgnaHVlSGFuZGxlJykgc2V0IGh1ZUhhbmRsZShlbGVtZW50OiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuaHVlSGFuZGxlVmlld0NoaWxkID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBvbkh1ZU1vdXNlZG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLmJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpO1xuXG4gICAgICAgIHRoaXMuaHVlRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnBpY2tIdWUoZXZlbnQpO1xuICAgIH1cblxuICAgIG9uSHVlVG91Y2hTdGFydChldmVudCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5odWVEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgIHRoaXMucGlja0h1ZShldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pO1xuICAgIH1cblxuICAgIG9uQ29sb3JUb3VjaFN0YXJ0KGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbG9yRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnBpY2tDb2xvcihldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pO1xuICAgIH1cblxuICAgIHBpY2tIdWUoZXZlbnQsIHBvc2l0aW9uPykge1xuICAgICAgICBsZXQgcGFnZVkgPSBwb3NpdGlvbiA/IHBvc2l0aW9uLnBhZ2VZIDogZXZlbnQucGFnZVk7XG4gICAgICAgIGxldCB0b3A6IG51bWJlciA9IHRoaXMuaHVlVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgKHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDApO1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWxpZGF0ZUhTQih7XG4gICAgICAgICAgICBoOiBNYXRoLmZsb29yKCgzNjAgKiAoMTUwIC0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTUwLCBwYWdlWSAtIHRvcCkpKSkgLyAxNTApLFxuICAgICAgICAgICAgczogdGhpcy52YWx1ZS5zLFxuICAgICAgICAgICAgYjogdGhpcy52YWx1ZS5iXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlQ29sb3JTZWxlY3RvcigpO1xuICAgICAgICB0aGlzLnVwZGF0ZVVJKCk7XG4gICAgICAgIHRoaXMudXBkYXRlTW9kZWwoKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHsgb3JpZ2luYWxFdmVudDogZXZlbnQsIHZhbHVlOiB0aGlzLmdldFZhbHVlVG9VcGRhdGUoKSB9KTtcbiAgICB9XG5cbiAgICBvbkNvbG9yTW91c2Vkb3duKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJpbmREb2N1bWVudE1vdXNlbW92ZUxpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuYmluZERvY3VtZW50TW91c2V1cExpc3RlbmVyKCk7XG5cbiAgICAgICAgdGhpcy5jb2xvckRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5waWNrQ29sb3IoZXZlbnQpO1xuICAgIH1cblxuICAgIG9uTW92ZShldmVudCkge1xuICAgICAgICBpZiAodGhpcy5jb2xvckRyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnBpY2tDb2xvcihldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmh1ZURyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnBpY2tIdWUoZXZlbnQsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkRyYWdFbmQoKSB7XG4gICAgICAgIHRoaXMuY29sb3JEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmh1ZURyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudE1vdXNlbW92ZUxpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIoKTtcbiAgICB9XG5cbiAgICBwaWNrQ29sb3IoZXZlbnQsIHBvc2l0aW9uPykge1xuICAgICAgICBsZXQgcGFnZVggPSBwb3NpdGlvbiA/IHBvc2l0aW9uLnBhZ2VYIDogZXZlbnQucGFnZVg7XG4gICAgICAgIGxldCBwYWdlWSA9IHBvc2l0aW9uID8gcG9zaXRpb24ucGFnZVkgOiBldmVudC5wYWdlWTtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNvbG9yU2VsZWN0b3JWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHRvcCA9IHJlY3QudG9wICsgKHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDApO1xuICAgICAgICBsZXQgbGVmdCA9IHJlY3QubGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcbiAgICAgICAgbGV0IHNhdHVyYXRpb24gPSBNYXRoLmZsb29yKCgxMDAgKiBNYXRoLm1heCgwLCBNYXRoLm1pbigxNTAsIHBhZ2VYIC0gbGVmdCkpKSAvIDE1MCk7XG4gICAgICAgIGxldCBicmlnaHRuZXNzID0gTWF0aC5mbG9vcigoMTAwICogKDE1MCAtIE1hdGgubWF4KDAsIE1hdGgubWluKDE1MCwgcGFnZVkgLSB0b3ApKSkpIC8gMTUwKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsaWRhdGVIU0Ioe1xuICAgICAgICAgICAgaDogdGhpcy52YWx1ZS5oLFxuICAgICAgICAgICAgczogc2F0dXJhdGlvbixcbiAgICAgICAgICAgIGI6IGJyaWdodG5lc3NcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVVSSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZU1vZGVsKCk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh7IG9yaWdpbmFsRXZlbnQ6IGV2ZW50LCB2YWx1ZTogdGhpcy5nZXRWYWx1ZVRvVXBkYXRlKCkgfSk7XG4gICAgfVxuXG4gICAgZ2V0VmFsdWVUb1VwZGF0ZSgpIHtcbiAgICAgICAgbGV0IHZhbDogYW55O1xuICAgICAgICBzd2l0Y2ggKHRoaXMuZm9ybWF0KSB7XG4gICAgICAgICAgICBjYXNlICdoZXgnOlxuICAgICAgICAgICAgICAgIHZhbCA9ICcjJyArIHRoaXMuSFNCdG9IRVgodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3JnYic6XG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5IU0J0b1JHQih0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnaHNiJzpcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICB1cGRhdGVNb2RlbCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMuZ2V0VmFsdWVUb1VwZGF0ZSgpKTtcbiAgICB9XG5cbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuSEVYdG9IU0IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JnYic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLlJHQnRvSFNCKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdoc2InOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuSEVYdG9IU0IodGhpcy5kZWZhdWx0Q29sb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVDb2xvclNlbGVjdG9yKCk7XG4gICAgICAgIHRoaXMudXBkYXRlVUkoKTtcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDb2xvclNlbGVjdG9yKCkge1xuICAgICAgICBpZiAodGhpcy5jb2xvclNlbGVjdG9yVmlld0NoaWxkKSB7XG4gICAgICAgICAgICBjb25zdCBoc2I6IGFueSA9IHt9O1xuICAgICAgICAgICAgaHNiLnMgPSAxMDA7XG4gICAgICAgICAgICBoc2IuYiA9IDEwMDtcbiAgICAgICAgICAgIGhzYi5oID0gdGhpcy52YWx1ZS5oO1xuXG4gICAgICAgICAgICB0aGlzLmNvbG9yU2VsZWN0b3JWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIycgKyB0aGlzLkhTQnRvSEVYKGhzYik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVVSSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29sb3JIYW5kbGVWaWV3Q2hpbGQgJiYgdGhpcy5odWVIYW5kbGVWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5jb2xvckhhbmRsZVZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnN0eWxlLmxlZnQgPSBNYXRoLmZsb29yKCgxNTAgKiB0aGlzLnZhbHVlLnMpIC8gMTAwKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLmNvbG9ySGFuZGxlVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuc3R5bGUudG9wID0gTWF0aC5mbG9vcigoMTUwICogKDEwMCAtIHRoaXMudmFsdWUuYikpIC8gMTAwKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLmh1ZUhhbmRsZVZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IE1hdGguZmxvb3IoMTUwIC0gKDE1MCAqIHRoaXMudmFsdWUuaCkgLyAzNjApICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5wdXRCZ0NvbG9yID0gJyMnICsgdGhpcy5IU0J0b0hFWCh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICBvbklucHV0Rm9jdXMoKSB7XG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQoKTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG5cbiAgICBvbk92ZXJsYXlBbmltYXRpb25TdGFydChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICAgICAgc3dpdGNoIChldmVudC50b1N0YXRlKSB7XG4gICAgICAgICAgICBjYXNlICd2aXNpYmxlJzpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaW5saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IGV2ZW50LmVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kT3ZlcmxheSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF1dG9aSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFpJbmRleFV0aWxzLnNldCgnb3ZlcmxheScsIHRoaXMub3ZlcmxheSwgdGhpcy5jb25maWcuekluZGV4Lm92ZXJsYXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGlnbk92ZXJsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRDbGlja0xpc3RlbmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kU2Nyb2xsTGlzdGVuZXIoKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNvbG9yU2VsZWN0b3IoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVVSSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlIaWRlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk92ZXJsYXlBbmltYXRpb25FbmQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQudG9TdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAndmlzaWJsZSc6XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlubGluZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU2hvdy5lbWl0KHt9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF1dG9aSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgWkluZGV4VXRpbHMuY2xlYXIoZXZlbnQuZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkhpZGUuZW1pdCh7fSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhcHBlbmRPdmVybGF5KCkge1xuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXBwZW5kVG8gPT09ICdib2R5JykgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXkpO1xuICAgICAgICAgICAgZWxzZSBEb21IYW5kbGVyLmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSwgdGhpcy5hcHBlbmRUbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXN0b3JlT3ZlcmxheUFwcGVuZCgpIHtcbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheSAmJiB0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5vdmVybGF5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFsaWduT3ZlcmxheSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXBwZW5kVG8pIERvbUhhbmRsZXIuYWJzb2x1dGVQb3NpdGlvbih0aGlzLm92ZXJsYXksIHRoaXMuaW5wdXRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIGVsc2UgRG9tSGFuZGxlci5yZWxhdGl2ZVBvc2l0aW9uKHRoaXMub3ZlcmxheSwgdGhpcy5pbnB1dFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50KTtcbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuXG4gICAgb25JbnB1dENsaWNrKCkge1xuICAgICAgICB0aGlzLnNlbGZDbGljayA9IHRydWU7XG4gICAgICAgIHRoaXMudG9nZ2xlUGFuZWwoKTtcbiAgICB9XG5cbiAgICB0b2dnbGVQYW5lbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlWaXNpYmxlKSB0aGlzLnNob3coKTtcbiAgICAgICAgZWxzZSB0aGlzLmhpZGUoKTtcbiAgICB9XG5cbiAgICBvbklucHV0S2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LndoaWNoKSB7XG4gICAgICAgICAgICAvL3NwYWNlXG4gICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlUGFuZWwoKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAvL2VzY2FwZSBhbmQgdGFiXG4gICAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25PdmVybGF5Q2xpY2soZXZlbnQpIHtcbiAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5hZGQoe1xuICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogZXZlbnQsXG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMuZWwubmF0aXZlRWxlbWVudFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlbGZDbGljayA9IHRydWU7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJPbkNoYW5nZShmbjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlID0gZm47XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQgPSBmbjtcbiAgICB9XG5cbiAgICBzZXREaXNhYmxlZFN0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gdmFsO1xuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cblxuICAgIGJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50VGFyZ2V0OiBhbnkgPSB0aGlzLmVsID8gdGhpcy5lbC5uYXRpdmVFbGVtZW50Lm93bmVyRG9jdW1lbnQgOiAnZG9jdW1lbnQnO1xuXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50VGFyZ2V0LCAnY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGZDbGljaykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRDbGlja0xpc3RlbmVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxmQ2xpY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJpbmREb2N1bWVudE1vdXNlbW92ZUxpc3RlbmVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRUYXJnZXQ6IGFueSA9IHRoaXMuZWwgPyB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQub3duZXJEb2N1bWVudCA6ICdkb2N1bWVudCc7XG5cbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50VGFyZ2V0LCAnbW91c2Vtb3ZlJywgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sb3JEcmFnZ2luZykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpY2tDb2xvcihldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaHVlRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrSHVlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVuYmluZERvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudE1vdXNlbW92ZUxpc3RlbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRvY3VtZW50TW91c2V1cExpc3RlbmVyKSB7XG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFRhcmdldDogYW55ID0gdGhpcy5lbCA/IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vd25lckRvY3VtZW50IDogJ2RvY3VtZW50JztcblxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudE1vdXNldXBMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50VGFyZ2V0LCAnbW91c2V1cCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmh1ZURyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudE1vdXNlbW92ZUxpc3RlbmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKSB7XG4gICAgICAgIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lciA9IHRoaXMub25XaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgdW5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcikge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25XaW5kb3dSZXNpemUoKSB7XG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXlWaXNpYmxlICYmICFEb21IYW5kbGVyLmlzVG91Y2hEZXZpY2UoKSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiaW5kU2Nyb2xsTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIgPSBuZXcgQ29ubmVjdGVkT3ZlcmxheVNjcm9sbEhhbmRsZXIodGhpcy5jb250YWluZXJWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm92ZXJsYXlWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyLmJpbmRTY3JvbGxMaXN0ZW5lcigpO1xuICAgIH1cblxuICAgIHVuYmluZFNjcm9sbExpc3RlbmVyKCkge1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIudW5iaW5kU2Nyb2xsTGlzdGVuZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhbGlkYXRlSFNCKGhzYikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaDogTWF0aC5taW4oMzYwLCBNYXRoLm1heCgwLCBoc2IuaCkpLFxuICAgICAgICAgICAgczogTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCBoc2IucykpLFxuICAgICAgICAgICAgYjogTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCBoc2IuYikpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFsaWRhdGVSR0IocmdiKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIHJnYi5yKSksXG4gICAgICAgICAgICBnOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIHJnYi5nKSksXG4gICAgICAgICAgICBiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIHJnYi5iKSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZUhFWChoZXgpIHtcbiAgICAgICAgdmFyIGxlbiA9IDYgLSBoZXgubGVuZ3RoO1xuICAgICAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAgICAgdmFyIG8gPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvLnB1c2goJzAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG8ucHVzaChoZXgpO1xuICAgICAgICAgICAgaGV4ID0gby5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGV4O1xuICAgIH1cblxuICAgIEhFWHRvUkdCKGhleCkge1xuICAgICAgICBsZXQgaGV4VmFsdWUgPSBwYXJzZUludChoZXguaW5kZXhPZignIycpID4gLTEgPyBoZXguc3Vic3RyaW5nKDEpIDogaGV4LCAxNik7XG4gICAgICAgIHJldHVybiB7IHI6IGhleFZhbHVlID4+IDE2LCBnOiAoaGV4VmFsdWUgJiAweDAwZmYwMCkgPj4gOCwgYjogaGV4VmFsdWUgJiAweDAwMDBmZiB9O1xuICAgIH1cblxuICAgIEhFWHRvSFNCKGhleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5SR0J0b0hTQih0aGlzLkhFWHRvUkdCKGhleCkpO1xuICAgIH1cblxuICAgIFJHQnRvSFNCKHJnYikge1xuICAgICAgICB2YXIgaHNiID0ge1xuICAgICAgICAgICAgaDogMCxcbiAgICAgICAgICAgIHM6IDAsXG4gICAgICAgICAgICBiOiAwXG4gICAgICAgIH07XG4gICAgICAgIHZhciBtaW4gPSBNYXRoLm1pbihyZ2IuciwgcmdiLmcsIHJnYi5iKTtcbiAgICAgICAgdmFyIG1heCA9IE1hdGgubWF4KHJnYi5yLCByZ2IuZywgcmdiLmIpO1xuICAgICAgICB2YXIgZGVsdGEgPSBtYXggLSBtaW47XG4gICAgICAgIGhzYi5iID0gbWF4O1xuICAgICAgICBoc2IucyA9IG1heCAhPSAwID8gKDI1NSAqIGRlbHRhKSAvIG1heCA6IDA7XG4gICAgICAgIGlmIChoc2IucyAhPSAwKSB7XG4gICAgICAgICAgICBpZiAocmdiLnIgPT0gbWF4KSB7XG4gICAgICAgICAgICAgICAgaHNiLmggPSAocmdiLmcgLSByZ2IuYikgLyBkZWx0YTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmdiLmcgPT0gbWF4KSB7XG4gICAgICAgICAgICAgICAgaHNiLmggPSAyICsgKHJnYi5iIC0gcmdiLnIpIC8gZGVsdGE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhzYi5oID0gNCArIChyZ2IuciAtIHJnYi5nKSAvIGRlbHRhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaHNiLmggPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBoc2IuaCAqPSA2MDtcbiAgICAgICAgaWYgKGhzYi5oIDwgMCkge1xuICAgICAgICAgICAgaHNiLmggKz0gMzYwO1xuICAgICAgICB9XG4gICAgICAgIGhzYi5zICo9IDEwMCAvIDI1NTtcbiAgICAgICAgaHNiLmIgKj0gMTAwIC8gMjU1O1xuICAgICAgICByZXR1cm4gaHNiO1xuICAgIH1cblxuICAgIEhTQnRvUkdCKGhzYikge1xuICAgICAgICB2YXIgcmdiID0ge1xuICAgICAgICAgICAgcjogbnVsbCxcbiAgICAgICAgICAgIGc6IG51bGwsXG4gICAgICAgICAgICBiOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIGxldCBoOiBudW1iZXIgPSBoc2IuaDtcbiAgICAgICAgbGV0IHM6IG51bWJlciA9IChoc2IucyAqIDI1NSkgLyAxMDA7XG4gICAgICAgIGxldCB2OiBudW1iZXIgPSAoaHNiLmIgKiAyNTUpIC8gMTAwO1xuICAgICAgICBpZiAocyA9PSAwKSB7XG4gICAgICAgICAgICByZ2IgPSB7XG4gICAgICAgICAgICAgICAgcjogdixcbiAgICAgICAgICAgICAgICBnOiB2LFxuICAgICAgICAgICAgICAgIGI6IHZcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgdDE6IG51bWJlciA9IHY7XG4gICAgICAgICAgICBsZXQgdDI6IG51bWJlciA9ICgoMjU1IC0gcykgKiB2KSAvIDI1NTtcbiAgICAgICAgICAgIGxldCB0MzogbnVtYmVyID0gKCh0MSAtIHQyKSAqIChoICUgNjApKSAvIDYwO1xuICAgICAgICAgICAgaWYgKGggPT0gMzYwKSBoID0gMDtcbiAgICAgICAgICAgIGlmIChoIDwgNjApIHtcbiAgICAgICAgICAgICAgICByZ2IuciA9IHQxO1xuICAgICAgICAgICAgICAgIHJnYi5iID0gdDI7XG4gICAgICAgICAgICAgICAgcmdiLmcgPSB0MiArIHQzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoIDwgMTIwKSB7XG4gICAgICAgICAgICAgICAgcmdiLmcgPSB0MTtcbiAgICAgICAgICAgICAgICByZ2IuYiA9IHQyO1xuICAgICAgICAgICAgICAgIHJnYi5yID0gdDEgLSB0MztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaCA8IDE4MCkge1xuICAgICAgICAgICAgICAgIHJnYi5nID0gdDE7XG4gICAgICAgICAgICAgICAgcmdiLnIgPSB0MjtcbiAgICAgICAgICAgICAgICByZ2IuYiA9IHQyICsgdDM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGggPCAyNDApIHtcbiAgICAgICAgICAgICAgICByZ2IuYiA9IHQxO1xuICAgICAgICAgICAgICAgIHJnYi5yID0gdDI7XG4gICAgICAgICAgICAgICAgcmdiLmcgPSB0MSAtIHQzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgcmdiLmIgPSB0MTtcbiAgICAgICAgICAgICAgICByZ2IuZyA9IHQyO1xuICAgICAgICAgICAgICAgIHJnYi5yID0gdDIgKyB0MztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaCA8IDM2MCkge1xuICAgICAgICAgICAgICAgIHJnYi5yID0gdDE7XG4gICAgICAgICAgICAgICAgcmdiLmcgPSB0MjtcbiAgICAgICAgICAgICAgICByZ2IuYiA9IHQxIC0gdDM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJnYi5yID0gMDtcbiAgICAgICAgICAgICAgICByZ2IuZyA9IDA7XG4gICAgICAgICAgICAgICAgcmdiLmIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHI6IE1hdGgucm91bmQocmdiLnIpLCBnOiBNYXRoLnJvdW5kKHJnYi5nKSwgYjogTWF0aC5yb3VuZChyZ2IuYikgfTtcbiAgICB9XG5cbiAgICBSR0J0b0hFWChyZ2IpIHtcbiAgICAgICAgdmFyIGhleCA9IFtyZ2Iuci50b1N0cmluZygxNiksIHJnYi5nLnRvU3RyaW5nKDE2KSwgcmdiLmIudG9TdHJpbmcoMTYpXTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gaGV4KSB7XG4gICAgICAgICAgICBpZiAoaGV4W2tleV0ubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICBoZXhba2V5XSA9ICcwJyArIGhleFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhleC5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBIU0J0b0hFWChoc2IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuUkdCdG9IRVgodGhpcy5IU0J0b1JHQihoc2IpKTtcbiAgICB9XG5cbiAgICBvbk92ZXJsYXlIaWRlKCkge1xuICAgICAgICB0aGlzLnVuYmluZFNjcm9sbExpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLnVuYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLm92ZXJsYXkgPSBudWxsO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXkgJiYgdGhpcy5hdXRvWkluZGV4KSB7XG4gICAgICAgICAgICBaSW5kZXhVdGlscy5jbGVhcih0aGlzLm92ZXJsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXN0b3JlT3ZlcmxheUFwcGVuZCgpO1xuICAgICAgICB0aGlzLm9uT3ZlcmxheUhpZGUoKTtcbiAgICB9XG59XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG4gICAgZXhwb3J0czogW0NvbG9yUGlja2VyXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtDb2xvclBpY2tlcl1cbn0pXG5leHBvcnQgY2xhc3MgQ29sb3JQaWNrZXJNb2R1bGUge31cbiJdfQ==