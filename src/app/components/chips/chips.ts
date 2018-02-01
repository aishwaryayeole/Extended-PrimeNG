import {NgModule,Component,ElementRef,ViewChild,Input,Output,EventEmitter,Renderer2,AfterContentInit,ContentChildren,QueryList,TemplateRef,ChangeDetectorRef,IterableDiffers,forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule,PrimeTemplate} from '../common/shared';
import {InputTextModule} from '../inputtext/inputtext';
import {DomHandler} from '../dom/domhandler';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {ObjectUtils} from '../utils/objectutils';


export const CHIPS_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Chips),
  multi: true
};

@Component({
    selector: 'p-chips',
    template: `
        <div [ngClass]="'ui-chips ui-widget'" [ngStyle]="style" [class]="styleClass">
            <ul [ngClass]="{'ui-inputtext ui-state-default ui-corner-all':true,'ui-state-focus':focus,'ui-state-disabled':disabled}" (click)="inputtext.focus()">
                <li #token *ngFor="let item of value; let i = index;" class="ui-chips-token ui-state-highlight ui-corner-all" >
                    <span *ngIf="!disabled" class="ui-chips-token-icon fa fa-fw fa-close" (click)="removeItem($event,i)"></span>
                    <span *ngIf="!itemTemplate" class="ui-chips-token-label">{{field ? resolveFieldData(item,field) : item}}</span>
                    <ng-template *ngIf="itemTemplate" [pTemplateWrapper]="itemTemplate" [item]="item"></ng-template>
                </li>
                <li class="ui-chips-input-token">
                    <input #inputtext type="text" [attr.id]="inputId" [attr.placeholder]="(value && value.length ? null : placeholder)" [attr.tabindex]="tabindex" (input)="onInput($event)" (keydown)="onKeydown($event,inputtext)" 
                        (focus)="onInputFocus($event)"  (blur)="onInputBlur($event,inputtext)" [disabled]="maxedOut||disabled" [disabled]="disabled" [ngStyle]="inputStyle" [class]="inputStyleClass">
                </li>
            </ul>
        </div>
        <i *ngIf="loading" class="ui-autocomplete-loader fa fa-circle-o-notch fa-spin fa-fw"></i><button #ddBtn type="button" pButton icon="fa-fw fa-caret-down" class="ui-autocomplete-dropdown" [disabled]="disabled" (click)="handleDropdownClick($event)" *ngIf="dropdown"></button>
        <div #panel class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-shadow" [style.display]="panelVisible ? 'block' : 'none'" [style.width]="appendTo ? 'auto' : '100%'" [style.max-height]="scrollHeight">
        <ul class="ui-autocomplete-items ui-autocomplete-list ui-widget-content ui-widget ui-corner-all ui-helper-reset" *ngIf="panelVisible">
         <li *ngFor="let i of FilteredSuggestionList; let idx = index" >
          <p [ngClass]="{'ui-autocomplete-list-item ui-corner-all':true,'ui-state-highlight':(highlightOption==i)}"
          (mouseenter)="highlightOption=i" (mouseleave)="highlightOption=null" (click)="selectItem($event,i.name,inputtext)">{{i.name}}</p>
          <span *ngIf="!itemTemplate">{{field ? objectUtils.resolveFieldData(option, field) : option}}</span>
          <ng-template *ngIf="itemTemplate" [pTemplateWrapper]="itemTemplate" [item]="option" [index]="idx"></ng-template>
         </li>
         <li *ngIf="noResults && emptyMessage" class="ui-autocomplete-list-item ui-corner-all">{{emptyMessage}}</li>
        </ul>
       </div>
        
    `,
    host: {
        '[class.ui-inputwrapper-filled]': 'filled',
        '[class.ui-inputwrapper-focus]': 'focus'
    },
    providers: [DomHandler,CHIPS_VALUE_ACCESSOR,ObjectUtils]
})
export class Chips implements AfterContentInit,ControlValueAccessor {
    @Input() scrollHeight: string = '150px';

    @Input() dataKey: string;

    @Input() FilteredSuggestionList: any[];

    @Input() delay: number = 300;

    @Input() minLength: number = 1;

    @Input() style: any;

    @Input() styleClass: string;
    
    @Input() disabled: boolean;

    @Output() onAdd: EventEmitter<any> = new EventEmitter();
    
    @Output() onRemove: EventEmitter<any> = new EventEmitter();
    
    @Input() field: string;
    
    @Input() placeholder: string;
    
    @Input() max: number;

    @Input() tabindex: number;

    @Input() inputId: string;
    
    @Input() allowDuplicate: boolean = true;
    
    @Input() inputStyle: any;
    
    @Input() inputStyleClass: any;
    
    @Input() addOnTab: boolean;

    @Input() addOnBlur: boolean;

    @Input() multiple: boolean;

    @Input() immutable: boolean = true;

    @Input() forceSelection: boolean;

    @Input() dropdownMode: string = 'blank';

    @Input() appendTo: any;

    @Output() completeMethod: EventEmitter<any> = new EventEmitter();

    @Output() onFocus: EventEmitter<any> = new EventEmitter();
    
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @Output() onDropdownClick: EventEmitter<any> = new EventEmitter();

    @Output() onClear: EventEmitter<any> = new EventEmitter();

    @ViewChild('multiIn') multiInputEL: ElementRef;

    @ViewChild('in') inputEL: ElementRef;
    
    @ContentChildren(PrimeTemplate) templates: QueryList<any>;

    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @ViewChild('panel') panelEL: ElementRef;

    @Input() dropdown: boolean;

    @ViewChild('ddBtn') dropdownButton: ElementRef;

    @ViewChild('multiContainer') multiContainerEL: ElementRef;

    @Input() autoHighlight: boolean;

    @Input() emptyMessage: string;
    
    public itemTemplate: TemplateRef<any>;
    documentClickListener: any;

    highlightOption: any;

    filled: boolean;

    inputFieldValue: string = null;

    panelVisible: boolean = false;
        
    value: any;
    
    onModelChange: Function = () => {};
    
    onModelTouched: Function = () => {};
        
    valueChanged: boolean;
    
    focus: boolean;

    loading: boolean;

    sample: any;

    _suggestions: any[];

    inputKeyDown: boolean;

    timeout: any;

    suggestionList: any[];

    noResults: boolean;

    inputClick: boolean;

    suggestionsUpdated: boolean;


            
    constructor(public el: ElementRef, public domHandler: DomHandler, public objectUtils: ObjectUtils, public cd: ChangeDetectorRef, public renderer: Renderer2) {
        this.suggestionList = [];
        this.FilteredSuggestionList= [];

        this.suggestionList.push("item 1");
        this.suggestionList.push("item 2");
        this.suggestionList.push("item 3");
        this.suggestionList.push("item 1");
        this.suggestionList.push("item 1");


    }
    unbindDocumentClickListener() {
        if(this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }

    hide() {
        this.panelVisible = false;
        this.unbindDocumentClickListener();
    }

    updateFilledState() {
        if(this.multiple)
            this.filled = (this.value && this.value.length) || (this.multiInputEL && this.multiInputEL.nativeElement && this.multiInputEL.nativeElement.value != '');
        else
            this.filled = (this.inputFieldValue && this.inputFieldValue != '') || (this.inputEL && this.inputEL.nativeElement && this.inputEL.nativeElement.value != '');;
    }

    
    onInput(event: KeyboardEvent) {

        /*if(!this.inputKeyDown) {
            return;
        }*/
      
        if(this.timeout) {
            clearTimeout(this.timeout);
        }

        let value = (<HTMLInputElement> event.target).value;
        if(!this.multiple && !this.forceSelection) {
            this.onModelChange(value);
        }
        
        if(value.length === 0) {
            this.hide();
            this.onClear.emit(event);
         }
        
        if(value.length >= this.minLength) {

            this.timeout = setTimeout(() => {
                this.searchItem(event, value);
            }, this.delay);
        }
        else {
            this.FilteredSuggestionList = null;
            this.hide();
        }
        this.updateFilledState();
    }

    isSelected(val: any): boolean {
        let selected: boolean = false;
        if(this.value && this.value.length) {
            for(let i = 0; i < this.value.length; i++) {
                if(this.objectUtils.equals(this.value[i], val, this.dataKey)) {
                    selected = true;
                    break;
                }
            }
        }
        return selected;
    }

    selectItem(event, option: any,inputtext, focus: boolean = true) {
        this.addItem(event, option);
        inputtext.value = '';
        this.FilteredSuggestionList=[];
        this.panelVisible = false;
        event.preventDefault();

    }


    searchItem(event: KeyboardEvent,item)
    {

        if(item === undefined || item === null) {
            return;
        }
        
        this.loading = true;
        
        this.completeMethod.emit({
            originalEvent: event,
            query: item
        });

        

    }

    isDropdownClick(event) {
        if(this.dropdown) {
            let target = event.target;
            return (target === this.dropdownButton.nativeElement || target.parentNode === this.dropdownButton.nativeElement);
        }
        else {
            return false;
        }
    }

    bindDocumentClickListener() {
        if(!this.documentClickListener) {
            this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
                if(event.which === 3) {
                    return;
                }
                
                if(!this.inputClick && !this.isDropdownClick(event)) {
                    this.hide();
                }
                    
                this.inputClick = false;
                this.cd.markForCheck();
            });
        }
    }

    show() {
        if(this.multiInputEL || this.inputEL) {
            let hasFocus = this.multiple ? document.activeElement == this.multiInputEL.nativeElement : document.activeElement == this.inputEL.nativeElement ;
            if(!this.panelVisible && hasFocus) {
                this.panelVisible = true;
                if(this.appendTo) {
                    this.panelEL.nativeElement.style.minWidth = this.domHandler.getWidth(this.el.nativeElement.children[0]) + 'px';
                }
                this.panelEL.nativeElement.style.zIndex = ++DomHandler.zindex;
                this.domHandler.fadeIn(this.panelEL.nativeElement, 200);
                this.bindDocumentClickListener();
            }   
        }
    }

    ngAfterViewInit() {
        if(this.appendTo) {
            if(this.appendTo === 'body')
                document.body.appendChild(this.panelEL.nativeElement);
            else
                this.domHandler.appendChild(this.panelEL.nativeElement, this.appendTo);
        }
    }

    align() {
        if(this.appendTo)
            this.domHandler.absolutePosition(this.panelEL.nativeElement, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
        else
            this.domHandler.relativePosition(this.panelEL.nativeElement, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
    }

    ngOnDestroy() {
        this.unbindDocumentClickListener();

        if(this.appendTo) {
            this.el.nativeElement.appendChild(this.panelEL.nativeElement);
        }
    }

    handleSuggestionsChange() {
        if(this.panelEL && this.panelEL.nativeElement && this.loading) {
            this.highlightOption = null;
            if(this.FilteredSuggestionList && this.FilteredSuggestionList.length) {
                this.noResults = false;
                this.show();
                this.suggestionsUpdated = true;
                
                if(this.autoHighlight) {
                    this.highlightOption = this._suggestions[0];
                }
            }
            else {
                this.noResults = true;
                
                if(this.emptyMessage) {    
                    this.show();
                    this.suggestionsUpdated = true;
                }
                else {
                    this.hide();
                }
            }
        }
        
        this.loading = false;
    }

    
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch(item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                break;
                
                default:
                    this.itemTemplate = item.template;
                break;
            }
        });
    }
    
    writeValue(value: any) : void {
        this.value = value;
    }
    
    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }
    
    setDisabledState(val: boolean): void {
        this.disabled = val;
    }
    
    resolveFieldData(data: any, field: string): any {
        if(data && field) {
            if(field.indexOf('.') == -1) {
                return data[field];
            }
            else {
                let fields: string[] = field.split('.');
                let value = data;
                for(var i = 0, len = fields.length; i < len; ++i) {
                    value = value[fields[i]];
                }
                return value;
            }
        }
        else {
            return null;
        }
    }
    
    onInputFocus(event: FocusEvent) {
        this.focus = true;
        this.onFocus.emit(event);
    }

    onInputBlur(event: FocusEvent, inputEL: HTMLInputElement) {
        this.focus = false;
        if(this.addOnBlur && inputEL.value) {
            this.addItem(event, inputEL.value);
            inputEL.value = '';
        }
        this.onModelTouched();
        this.onBlur.emit(event);
    }

    
    removeItem(event: Event, index: number): void {
        if(this.disabled) {
            return;
        }
        
        let removedItem = this.value[index];
        this.value = this.value.filter((val, i) => i!=index);
        this.onModelChange(this.value);
        this.onRemove.emit({
            originalEvent: event,
            value: removedItem
        });
    }
    
    addItem(event: Event, item: string): void {
        this.value = this.value||[];
        if(item && item.trim().length && (!this.max||this.max > item.length)) {
            if(this.allowDuplicate || this.value.indexOf(item) === -1) {
                this.value = [...this.value, item];
                this.onModelChange(this.value);
                this.onAdd.emit({
                    originalEvent: event,
                    value: item
                });
            }
        }     
    }


  
    
    onKeydown(event: KeyboardEvent, inputEL: HTMLInputElement): void {
        this.panelVisible = true;
        if(this.panelVisible) {
        switch(event.which) {
                //backspace
                case 8:
                    if(inputEL.value.length === 0 && this.value && this.value.length > 0) {
                        this.value = [...this.value];
                        let removedItem = this.value.pop();
                        this.onModelChange(this.value);
                        this.onRemove.emit({
                            originalEvent: event,
                            value: removedItem
                        });
                    }
                break;
                
                //enter
                case 13:
            
                    this.addItem(event, inputEL.value);
                    inputEL.value = '';
                    this.panelVisible = false;
                    event.preventDefault();
                break;
                    
                
                default:
                    if(this.max && this.value && this.max === this.value.length) {
                        event.preventDefault();
                    }
                break;
                
            }
        }
        this.inputKeyDown = true;
        
    }

    focusInput() {
        if(this.multiple)
            this.multiInputEL.nativeElement.focus();
        else
            this.inputEL.nativeElement.focus();
    }

    handleDropdownClick(event) {
        this.focusInput();
        let queryValue = this.multiple ? this.multiInputEL.nativeElement.value : this.inputEL.nativeElement.value;
        
        if(this.dropdownMode === 'blank')
            this.searchItem(event, '');
        else if(this.dropdownMode === 'current')
            this.searchItem(event, queryValue);
        
        this.onDropdownClick.emit({
            originalEvent: event,
            query: queryValue
        });
    }
    
    get maxedOut(): boolean {
        return this.max && this.value && this.max === this.value.length;
    }
}

@NgModule({
    imports: [CommonModule,InputTextModule,SharedModule],
    exports: [Chips,InputTextModule,SharedModule],
    declarations: [Chips]
})
export class ChipsModule { }
