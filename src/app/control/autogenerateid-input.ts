
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';



@Component({
 selector: 'autogenerateid-input',
 template: `
    <input
      *ngIf="this.field.type !== 'number'; else numberTmp"
      matInput
      #input
      [id]="id"
      [type]="this.field.type || 'text'"
      [readonly]="to.readonly"
      [required]="to.required"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [tabIndex]="to.tabindex"
      [placeholder]="to.placeholder"
      (keydown.enter)="frmSubmit($event,field)"
      (input)="inputEvent(input, $event)"
      (focus)="onFocus($event)"
    />
    <ng-template #numberTmp>
      <input
        matInput
        [id]="id"
        type="number"
        [readonly]="to.readonly"
        [required]="to.required",
        [formControl]="FormControl"
        [formlyAttributes]="field"
        [tabIndex]="to.tabindex"
        [placeholder]="to.placeholder"
        (keydown.enter)="frmSubmit($event,field)"
        (focus)="onFocus($event)"
      />
    </ng-template>
 `,
})
export class AutogenerateId extends FieldType<any> implements OnInit {
  
  constructor(private dataService:DataService){
    super();
  }

   ngOnInit() {
   //this.getAutoNumber();
    if(!this.field.templateOptions?.isEdit) {
      this.getAutoNumber();
    } else {
      this.field.templateOptions.readonly = true
    }
  }
  public get FormControl() {
    return this.formControl as FormControl;
  }
  frmSubmit(event:any,field:any) {
    //debugger
    if (!field.templateOptions.onEnterSubmit) {
      try {
        let ctrl = event.currentTarget.form.elements[event.currentTarget.tabIndex+1]
        ctrl.focus()
        ctrl.click()
      } catch {

      }
      event.preventDefault()
      event.stopPropagation()
    }
  }

  frmLeave(value:any, field:any) {
    if(field.templateOptions.searchableField) {
      var filterQuery = [{
        clause: "$and",
        conditions: [
         {column: field.templateOptions.searchColumnName, operator: "$eq", value:value},
       ]
     }]
     this.dataService.getDataByFilter(field.templateOptions.searchCollectionName,filterQuery).subscribe(
       (result:any) => {
         var list = result.data || [];
        //  field.parent.formControl.value[field.templateOptions.searchResult] = list;
         field.parent.formControl.get(field.templateOptions.columnName)._fields[0].templateOptions.options = list
       },
       error => {
           //Show the error popup
           console.error('There was an error!', error);
       }
     );
    }
  }

  getAutoNumber() {
    var opt = this.field?.props['autoId']
    if (opt) {
      this.field.formControl.setValue('[Auto Number]')
      this.field.props.readonly = true
    }
  }

  getValue(val:any,opt:any) {
    opt.suffix || ''
    var l = (opt.pattern || '000000').length
    return (opt.prefix || '') + val.toString().padStart(l, 0) + (opt.suffix || '')
  }

  onFocus(event:any) {
      setTimeout(()=>{
        event.target.select()
      }, 50);
  }

  inputEvent(input: any, event: any) {
  input.value = event.target.value.toUpperCase();
  }
}
