import * as i0 from '@angular/core';
import { Directive, Input, HostListener, Pipe, forwardRef, EventEmitter, Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, Output, ContentChildren, NgModule } from '@angular/core';
import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomHandler, ConnectedOverlayScrollHandler } from 'primeng/dom';
import * as i1 from 'primeng/api';
import { TranslationKeys, PrimeTemplate, SharedModule } from 'primeng/api';
import { ZIndexUtils } from 'primeng/utils';
import * as i3 from 'primeng/inputtext';
import { InputTextModule } from 'primeng/inputtext';

class PasswordDirective {
    constructor(el, zone) {
        this.el = el;
        this.zone = zone;
        this.promptLabel = 'Enter a password';
        this.weakLabel = 'Weak';
        this.mediumLabel = 'Medium';
        this.strongLabel = 'Strong';
        this.feedback = true;
    }
    set showPassword(show) {
        this.el.nativeElement.type = show ? 'text' : 'password';
    }
    ngDoCheck() {
        this.updateFilledState();
    }
    onInput(e) {
        this.updateFilledState();
    }
    updateFilledState() {
        this.filled = this.el.nativeElement.value && this.el.nativeElement.value.length;
    }
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'p-password-panel p-component p-password-panel-overlay p-connected-overlay';
        this.meter = document.createElement('div');
        this.meter.className = 'p-password-meter';
        this.info = document.createElement('div');
        this.info.className = 'p-password-info';
        this.info.textContent = this.promptLabel;
        this.panel.appendChild(this.meter);
        this.panel.appendChild(this.info);
        this.panel.style.minWidth = DomHandler.getOuterWidth(this.el.nativeElement) + 'px';
        document.body.appendChild(this.panel);
    }
    showOverlay() {
        if (this.feedback) {
            if (!this.panel) {
                this.createPanel();
            }
            this.panel.style.zIndex = String(++DomHandler.zindex);
            this.panel.style.display = 'block';
            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    DomHandler.addClass(this.panel, 'p-connected-overlay-visible');
                    this.bindScrollListener();
                    this.bindDocumentResizeListener();
                }, 1);
            });
            DomHandler.absolutePosition(this.panel, this.el.nativeElement);
        }
    }
    hideOverlay() {
        if (this.feedback && this.panel) {
            DomHandler.addClass(this.panel, 'p-connected-overlay-hidden');
            DomHandler.removeClass(this.panel, 'p-connected-overlay-visible');
            this.unbindScrollListener();
            this.unbindDocumentResizeListener();
            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    this.ngOnDestroy();
                }, 150);
            });
        }
    }
    onFocus() {
        this.showOverlay();
    }
    onBlur() {
        this.hideOverlay();
    }
    onKeyup(e) {
        if (this.feedback) {
            let value = e.target.value, label = null, meterPos = null;
            if (value.length === 0) {
                label = this.promptLabel;
                meterPos = '0px 0px';
            }
            else {
                var score = this.testStrength(value);
                if (score < 30) {
                    label = this.weakLabel;
                    meterPos = '0px -10px';
                }
                else if (score >= 30 && score < 80) {
                    label = this.mediumLabel;
                    meterPos = '0px -20px';
                }
                else if (score >= 80) {
                    label = this.strongLabel;
                    meterPos = '0px -30px';
                }
            }
            if (!this.panel || !DomHandler.hasClass(this.panel, 'p-connected-overlay-visible')) {
                this.showOverlay();
            }
            this.meter.style.backgroundPosition = meterPos;
            this.info.textContent = label;
        }
    }
    testStrength(str) {
        let grade = 0;
        let val;
        val = str.match('[0-9]');
        grade += this.normalize(val ? val.length : 1 / 4, 1) * 25;
        val = str.match('[a-zA-Z]');
        grade += this.normalize(val ? val.length : 1 / 2, 3) * 10;
        val = str.match('[!@#$%^&*?_~.,;=]');
        grade += this.normalize(val ? val.length : 1 / 6, 1) * 35;
        val = str.match('[A-Z]');
        grade += this.normalize(val ? val.length : 1 / 6, 1) * 30;
        grade *= str.length / 8;
        return grade > 100 ? 100 : grade;
    }
    normalize(x, y) {
        let diff = x - y;
        if (diff <= 0)
            return x / y;
        else
            return 1 + 0.5 * (x / (x + y / 4));
    }
    get disabled() {
        return this.el.nativeElement.disabled;
    }
    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.el.nativeElement, () => {
                if (DomHandler.hasClass(this.panel, 'p-connected-overlay-visible')) {
                    this.hideOverlay();
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
        if (!DomHandler.isTouchDevice()) {
            this.hideOverlay();
        }
    }
    ngOnDestroy() {
        if (this.panel) {
            if (this.scrollHandler) {
                this.scrollHandler.destroy();
                this.scrollHandler = null;
            }
            this.unbindDocumentResizeListener();
            document.body.removeChild(this.panel);
            this.panel = null;
            this.meter = null;
            this.info = null;
        }
    }
}
PasswordDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: PasswordDirective, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
PasswordDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.7", type: PasswordDirective, selector: "[pPassword]", inputs: { promptLabel: "promptLabel", weakLabel: "weakLabel", mediumLabel: "mediumLabel", strongLabel: "strongLabel", feedback: "feedback", showPassword: "showPassword" }, host: { listeners: { "input": "onInput($event)", "focus": "onFocus()", "blur": "onBlur()", "keyup": "onKeyup($event)" }, properties: { "class.p-filled": "filled" }, classAttribute: "p-inputtext p-component p-element" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: PasswordDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[pPassword]',
                    host: {
                        class: 'p-inputtext p-component p-element',
                        '[class.p-filled]': 'filled'
                    }
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { promptLabel: [{
                type: Input
            }], weakLabel: [{
                type: Input
            }], mediumLabel: [{
                type: Input
            }], strongLabel: [{
                type: Input
            }], feedback: [{
                type: Input
            }], showPassword: [{
                type: Input
            }], onInput: [{
                type: HostListener,
                args: ['input', ['$event']]
            }], onFocus: [{
                type: HostListener,
                args: ['focus']
            }], onBlur: [{
                type: HostListener,
                args: ['blur']
            }], onKeyup: [{
                type: HostListener,
                args: ['keyup', ['$event']]
            }] } });
class MapperPipe {
    transform(value, mapper, ...args) {
        return mapper(value, ...args);
    }
}
MapperPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: MapperPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MapperPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "14.0.7", ngImport: i0, type: MapperPipe, name: "mapper" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: MapperPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'mapper',
                    pure: true
                }]
        }] });
const Password_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Password),
    multi: true
};
class Password {
    constructor(cd, config, el, overlayService) {
        this.cd = cd;
        this.config = config;
        this.el = el;
        this.overlayService = overlayService;
        this.mediumRegex = '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})';
        this.strongRegex = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})';
        this.feedback = true;
        this.showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
        this.hideTransitionOptions = '.1s linear';
        this.showClear = false;
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
        this.onClear = new EventEmitter();
        this.overlayVisible = false;
        this.focused = false;
        this.unmasked = false;
        this.value = null;
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this.contentTemplate = item.template;
                    break;
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                case 'footer':
                    this.footerTemplate = item.template;
                    break;
                default:
                    this.contentTemplate = item.template;
                    break;
            }
        });
    }
    ngOnInit() {
        this.infoText = this.promptText();
        this.mediumCheckRegExp = new RegExp(this.mediumRegex);
        this.strongCheckRegExp = new RegExp(this.strongRegex);
        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            this.updateUI(this.value || '');
        });
    }
    onAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                this.overlay = event.element;
                ZIndexUtils.set('overlay', this.overlay, this.config.zIndex.overlay);
                this.appendContainer();
                this.alignOverlay();
                this.bindScrollListener();
                this.bindResizeListener();
                break;
            case 'void':
                this.unbindScrollListener();
                this.unbindResizeListener();
                this.overlay = null;
                break;
        }
    }
    onAnimationEnd(event) {
        switch (event.toState) {
            case 'void':
                ZIndexUtils.clear(event.element);
                break;
        }
    }
    appendContainer() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.overlay);
            else
                document.getElementById(this.appendTo).appendChild(this.overlay);
        }
    }
    alignOverlay() {
        if (this.appendTo) {
            this.overlay.style.minWidth = DomHandler.getOuterWidth(this.input.nativeElement) + 'px';
            DomHandler.absolutePosition(this.overlay, this.input.nativeElement);
        }
        else {
            DomHandler.relativePosition(this.overlay, this.input.nativeElement);
        }
    }
    onInput(event) {
        this.value = event.target.value;
        this.onModelChange(this.value);
        this.onModelTouched();
    }
    onInputFocus(event) {
        this.focused = true;
        if (this.feedback) {
            this.overlayVisible = true;
        }
        this.onFocus.emit(event);
    }
    onInputBlur(event) {
        this.focused = false;
        if (this.feedback) {
            this.overlayVisible = false;
        }
        this.onBlur.emit(event);
    }
    onKeyDown(event) {
        if (event.key === 'Escape') {
            this.overlayVisible = false;
        }
    }
    onKeyUp(event) {
        if (this.feedback) {
            let value = event.target.value;
            this.updateUI(value);
            if (!this.overlayVisible) {
                this.overlayVisible = true;
            }
        }
    }
    updateUI(value) {
        let label = null;
        let meter = null;
        switch (this.testStrength(value)) {
            case 1:
                label = this.weakText();
                meter = {
                    strength: 'weak',
                    width: '33.33%'
                };
                break;
            case 2:
                label = this.mediumText();
                meter = {
                    strength: 'medium',
                    width: '66.66%'
                };
                break;
            case 3:
                label = this.strongText();
                meter = {
                    strength: 'strong',
                    width: '100%'
                };
                break;
            default:
                label = this.promptText();
                meter = null;
                break;
        }
        this.meter = meter;
        this.infoText = label;
    }
    onMaskToggle() {
        this.unmasked = !this.unmasked;
    }
    onOverlayClick(event) {
        this.overlayService.add({
            originalEvent: event,
            target: this.el.nativeElement
        });
    }
    testStrength(str) {
        let level = 0;
        if (this.strongCheckRegExp.test(str))
            level = 3;
        else if (this.mediumCheckRegExp.test(str))
            level = 2;
        else if (str.length)
            level = 1;
        return level;
    }
    writeValue(value) {
        if (value === undefined)
            this.value = null;
        else
            this.value = value;
        if (this.feedback)
            this.updateUI(this.value || '');
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    setDisabledState(val) {
        this.disabled = val;
    }
    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.input.nativeElement, () => {
                if (this.overlayVisible) {
                    this.overlayVisible = false;
                }
            });
        }
        this.scrollHandler.bindScrollListener();
    }
    bindResizeListener() {
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.overlayVisible && !DomHandler.isTouchDevice()) {
                    this.overlayVisible = false;
                }
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }
    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }
    unbindResizeListener() {
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
    }
    unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
        }
    }
    containerClass(toggleMask) {
        return { 'p-password p-component p-inputwrapper': true, 'p-input-icon-right': toggleMask };
    }
    inputFieldClass(disabled) {
        return { 'p-password-input': true, 'p-disabled': disabled };
    }
    toggleIconClass(unmasked) {
        return unmasked ? 'pi pi-eye-slash' : 'pi pi-eye';
    }
    strengthClass(meter) {
        return `p-password-strength ${meter ? meter.strength : ''}`;
    }
    filled() {
        return this.value != null && this.value.toString().length > 0;
    }
    promptText() {
        return this.promptLabel || this.getTranslation(TranslationKeys.PASSWORD_PROMPT);
    }
    weakText() {
        return this.weakLabel || this.getTranslation(TranslationKeys.WEAK);
    }
    mediumText() {
        return this.mediumLabel || this.getTranslation(TranslationKeys.MEDIUM);
    }
    strongText() {
        return this.strongLabel || this.getTranslation(TranslationKeys.STRONG);
    }
    restoreAppend() {
        if (this.overlay && this.appendTo) {
            if (this.appendTo === 'body')
                document.body.removeChild(this.overlay);
            else
                document.getElementById(this.appendTo).removeChild(this.overlay);
        }
    }
    inputType(unmasked) {
        return unmasked ? 'text' : 'password';
    }
    getTranslation(option) {
        return this.config.getTranslation(option);
    }
    clear() {
        this.value = null;
        this.onModelChange(this.value);
        this.writeValue(this.value);
        this.onClear.emit();
    }
    ngOnDestroy() {
        if (this.overlay) {
            ZIndexUtils.clear(this.overlay);
            this.overlay = null;
        }
        this.restoreAppend();
        this.unbindResizeListener();
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
    }
}
Password.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: Password, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.PrimeNGConfig }, { token: i0.ElementRef }, { token: i1.OverlayService }], target: i0.ɵɵFactoryTarget.Component });
Password.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.7", type: Password, selector: "p-password", inputs: { ariaLabel: "ariaLabel", ariaLabelledBy: "ariaLabelledBy", label: "label", disabled: "disabled", promptLabel: "promptLabel", mediumRegex: "mediumRegex", strongRegex: "strongRegex", weakLabel: "weakLabel", mediumLabel: "mediumLabel", strongLabel: "strongLabel", inputId: "inputId", feedback: "feedback", appendTo: "appendTo", toggleMask: "toggleMask", inputStyleClass: "inputStyleClass", panelStyle: "panelStyle", panelStyleClass: "panelStyleClass", styleClass: "styleClass", style: "style", inputStyle: "inputStyle", showTransitionOptions: "showTransitionOptions", hideTransitionOptions: "hideTransitionOptions", placeholder: "placeholder", showClear: "showClear" }, outputs: { onFocus: "onFocus", onBlur: "onBlur", onClear: "onClear" }, host: { properties: { "class.p-inputwrapper-filled": "filled()", "class.p-inputwrapper-focus": "focused", "class.p-password-clearable": "showClear", "class.p-password-mask": "toggleMask" }, classAttribute: "p-element p-inputwrapper" }, providers: [Password_VALUE_ACCESSOR], queries: [{ propertyName: "templates", predicate: PrimeTemplate }], viewQueries: [{ propertyName: "input", first: true, predicate: ["input"], descendants: true }], ngImport: i0, template: `
        <div [ngClass]="toggleMask | mapper: containerClass" [ngStyle]="style" [class]="styleClass">
            <input
                #input
                [attr.label]="label"
                [attr.aria-label]="ariaLabel"
                [attr.aria-labelledBy]="ariaLabelledBy"
                [attr.id]="inputId"
                pInputText
                [ngClass]="disabled | mapper: inputFieldClass"
                [ngStyle]="inputStyle"
                [class]="inputStyleClass"
                [attr.type]="unmasked | mapper: inputType"
                [attr.placeholder]="placeholder"
                [value]="value"
                (input)="onInput($event)"
                (focus)="onInputFocus($event)"
                (blur)="onInputBlur($event)"
                (keyup)="onKeyUp($event)"
                (keydown)="onKeyDown($event)"
            />
            <i *ngIf="showClear && value != null" class="p-password-clear-icon pi pi-times" (click)="clear()"></i>
            <i *ngIf="toggleMask" [ngClass]="unmasked | mapper: toggleIconClass" (click)="onMaskToggle()"></i>
            <div
                #overlay
                *ngIf="overlayVisible"
                [ngClass]="'p-password-panel p-component'"
                (click)="onOverlayClick($event)"
                [@overlayAnimation]="{ value: 'visible', params: { showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions } }"
                (@overlayAnimation.start)="onAnimationStart($event)"
                (@overlayAnimation.done)="onAnimationEnd($event)"
            >
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                <ng-container *ngIf="contentTemplate; else content">
                    <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
                </ng-container>
                <ng-template #content>
                    <div class="p-password-meter">
                        <div [ngClass]="meter | mapper: strengthClass" [ngStyle]="{ width: meter ? meter.width : '' }"></div>
                    </div>
                    <div className="p-password-info">{{ infoText }}</div>
                </ng-template>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </div>
    `, isInline: true, styles: [".p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0%;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password-clearable{position:relative}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i2.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i3.InputText, selector: "[pInputText]" }, { kind: "pipe", type: MapperPipe, name: "mapper" }], animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]), transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])])], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: Password, decorators: [{
            type: Component,
            args: [{ selector: 'p-password', template: `
        <div [ngClass]="toggleMask | mapper: containerClass" [ngStyle]="style" [class]="styleClass">
            <input
                #input
                [attr.label]="label"
                [attr.aria-label]="ariaLabel"
                [attr.aria-labelledBy]="ariaLabelledBy"
                [attr.id]="inputId"
                pInputText
                [ngClass]="disabled | mapper: inputFieldClass"
                [ngStyle]="inputStyle"
                [class]="inputStyleClass"
                [attr.type]="unmasked | mapper: inputType"
                [attr.placeholder]="placeholder"
                [value]="value"
                (input)="onInput($event)"
                (focus)="onInputFocus($event)"
                (blur)="onInputBlur($event)"
                (keyup)="onKeyUp($event)"
                (keydown)="onKeyDown($event)"
            />
            <i *ngIf="showClear && value != null" class="p-password-clear-icon pi pi-times" (click)="clear()"></i>
            <i *ngIf="toggleMask" [ngClass]="unmasked | mapper: toggleIconClass" (click)="onMaskToggle()"></i>
            <div
                #overlay
                *ngIf="overlayVisible"
                [ngClass]="'p-password-panel p-component'"
                (click)="onOverlayClick($event)"
                [@overlayAnimation]="{ value: 'visible', params: { showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions } }"
                (@overlayAnimation.start)="onAnimationStart($event)"
                (@overlayAnimation.done)="onAnimationEnd($event)"
            >
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                <ng-container *ngIf="contentTemplate; else content">
                    <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
                </ng-container>
                <ng-template #content>
                    <div class="p-password-meter">
                        <div [ngClass]="meter | mapper: strengthClass" [ngStyle]="{ width: meter ? meter.width : '' }"></div>
                    </div>
                    <div className="p-password-info">{{ infoText }}</div>
                </ng-template>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </div>
    `, animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]), transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])])], host: {
                        class: 'p-element p-inputwrapper',
                        '[class.p-inputwrapper-filled]': 'filled()',
                        '[class.p-inputwrapper-focus]': 'focused',
                        '[class.p-password-clearable]': 'showClear',
                        '[class.p-password-mask]': 'toggleMask'
                    }, providers: [Password_VALUE_ACCESSOR], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, styles: [".p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0%;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password-clearable{position:relative}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }, { type: i1.PrimeNGConfig }, { type: i0.ElementRef }, { type: i1.OverlayService }]; }, propDecorators: { ariaLabel: [{
                type: Input
            }], ariaLabelledBy: [{
                type: Input
            }], label: [{
                type: Input
            }], disabled: [{
                type: Input
            }], promptLabel: [{
                type: Input
            }], mediumRegex: [{
                type: Input
            }], strongRegex: [{
                type: Input
            }], weakLabel: [{
                type: Input
            }], mediumLabel: [{
                type: Input
            }], strongLabel: [{
                type: Input
            }], inputId: [{
                type: Input
            }], feedback: [{
                type: Input
            }], appendTo: [{
                type: Input
            }], toggleMask: [{
                type: Input
            }], inputStyleClass: [{
                type: Input
            }], panelStyle: [{
                type: Input
            }], panelStyleClass: [{
                type: Input
            }], styleClass: [{
                type: Input
            }], style: [{
                type: Input
            }], inputStyle: [{
                type: Input
            }], showTransitionOptions: [{
                type: Input
            }], hideTransitionOptions: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], showClear: [{
                type: Input
            }], input: [{
                type: ViewChild,
                args: ['input']
            }], onFocus: [{
                type: Output
            }], onBlur: [{
                type: Output
            }], onClear: [{
                type: Output
            }], templates: [{
                type: ContentChildren,
                args: [PrimeTemplate]
            }] } });
class PasswordModule {
}
PasswordModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: PasswordModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
PasswordModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.0.7", ngImport: i0, type: PasswordModule, declarations: [PasswordDirective, Password, MapperPipe], imports: [CommonModule, InputTextModule], exports: [PasswordDirective, Password, SharedModule] });
PasswordModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: PasswordModule, imports: [CommonModule, InputTextModule, SharedModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.7", ngImport: i0, type: PasswordModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, InputTextModule],
                    exports: [PasswordDirective, Password, SharedModule],
                    declarations: [PasswordDirective, Password, MapperPipe]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { MapperPipe, Password, PasswordDirective, PasswordModule, Password_VALUE_ACCESSOR };
//# sourceMappingURL=primeng-password.mjs.map
