import {
  Component,
  OnInit,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { DataService } from "../services/data.service";

@Component({
  selector: "select-input",
  template: `
    <!-- <div class="center"><span>{{field.props!['label']}}</span></div> -->

    <mat-form-field>
      <mat-label>{{ field.props!["label"] }}</mat-label>
      <mat-select
        #matSelectInput
        [formlyAttributes]="field"
        [formControl]="thisFormControl"
        [required]="this.field.props.required"
        *ngIf="!field.props.readonly"
      >
        <mat-option
          *ngFor="let op of this.opt.options"
          [value]="op[this.valueProp]"
          (click)="selectionChange(op)"
        >
          <span [innerHTML]="op[this.labelProp]"></span>
        </mat-option>
      </mat-select>
      <mat-error *ngIf="this.field.props.required"
        >This {{ this.field.props?.label }} is required</mat-error
      >
      <input
        matInput
        readonly
        [formlyAttributes]="field"
        [value]="selectedValue"
        *ngIf="field.props.readonly"
      />
    </mat-form-field>
  `,
})
export class SelectInput extends FieldType<any> implements OnInit {
  opt: any;
  data: any;
  currentField: any;
  //default prop setting

  //default prop setting
  valueProp = "id";
  labelProp = "name";
  dropdown: any;
  selectedValue: any = "";
  selectedObject: any;
  optionsValue:any;
  constructor(public dataService: DataService) {
    super();
  }

  public get thisFormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field;
    this.subscribeOnValueChangeEvent();
    //below logic only for dynamic selection option
  if(this?.field?.props?.custom_filter){
    let name=this.field.props.collectionName
    var filterCondition1 =
   {filter: [
   {
    clause: "AND",
    conditions: [
     { column: 'is_collection', operator: "EQUALS", value:  "Yes"},
    ]
   }
   ]}
   // model_config
   //! to chnage 
   // this.dataService.getotherModuleName(model_name)
   this.dataService.getDataByFilter(name,filterCondition1)
   .subscribe((abc: any) => {
     console.log(abc);
     const unmatchedNames = abc.data[0].response;
     // Update the options array within the subscription
     this.field.props.options = unmatchedNames.map((name: any) => {
       return { model_name: name.model_name, collection_name: name.collection_name };
     });
     this.optionsValue = this.field.props.options;
     console.log(this.optionsValue)
   });
 
  }
  if(this?.opt?.flag){
const keys=this.opt.parentkeys
let values:any
var filterCondition :any 
if(this.opt.Child){

  values=this.currentField.form._parent._parent.value
  filterCondition =
    [
   {
    clause: "AND",
    conditions: [
     { column: 'model_name', operator: "EQUALS", value:values[keys]  },
    ]
   }
   ]
}else{
  console.log('else');
  console.log(this.model);
  
  values= this.model[keys]
  filterCondition =
   {filter: [
   {
    clause: "AND",
    conditions: [
     { column: 'model_name', operator: "EQUALS", value:values },
    ]
   }
   ]
}   }
   // model_config
   //! to chnage 
   // this.dataService.getotherModuleName(model_name)
   this.dataService.getDataByFilter(this.opt.collectionName,filterCondition)
   .subscribe((res: any) => {
     
     const unmatchedNames = res.data[0].response

     // Update the options array within the subscription
     this.field.props.options = unmatchedNames.map((name: any) => {
      let field_name=name.column_name.toLowerCase()
      let data:any={}

      if(name.is_reference){
data.collection_name=name.collection_name
data.field=name.field
return { name: name.column_name, field_name:field_name,reference:name.is_reference, orbitalvaule: data ,type:name.type};

      }else{
       return { name: name.column_name, field_name:field_name,type:name.type};

      }
      // to add collection and fiels and references
     });
     this.optionsValue = this.field.props.options;
     console.log(this.optionsValue)
   });
  }
    if (this?.opt?.optionsDataSource?.collectionName!=undefined) {
      let name = this.opt.optionsDataSource.collectionName;
      this.dataService.getDataByFilter(name,{}).subscribe((res: any) => {
        console.log(res);
        
        this.dataService.buildOptions(res.data[0].response, this.opt);

        if (this.field.props.attribute) {
          //if the data in array of object
          let data = this.field.key
            .split(".")
            .reduce((o: any, i: any) => o[i], this.model);
          this.field.formControl.setValue(data);
        } else {
          this.field.formControl.setValue(this.model[this.field.key]);
        }
      });
    }

    if (this?.opt?.optionsDataSource?.collectionNameById!=undefined) {
      let name = this.opt.optionsDataSource.collectionNameById;
      let id = sessionStorage.getItem("projectname");
      console.log(id);
      this.dataService.getDataById(name, id).subscribe((res: any) => {
        ;
        this.dataService.buildOptions(res, this.opt);

        if (this.field.props.attribute) {
          //if the data in array of object
          let data = this.field.key
            .split(".")
            .reduce((o: any, i: any) => o[i], this.model);
          this.field.formControl.setValue(data);
        } else {
          this.field.formControl.setValue(this.model[this.field.key]);
        }
      });
    }

    if (this.currentField.parentKey != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.currentField.parentKey); //this.opt.parent_key);        
        parentControl?.valueChanges.subscribe((val: any) => {
          let selectedOption: any;
          if (val == undefined) return;
          if (this.field.props.attribute == "array_of_object") {
            
            selectedOption = this.field.parentKey
              .split(".")
              .reduce((o: any, i: any) => o[i], this.model);
          } else {
            selectedOption = this.model[this.currentField.parentKey];
          }
          if (selectedOption != undefined) {
            this.dataService
              .getDataById(
                this.opt.optionsDataSource?.ParentcollectionName,
                selectedOption
              )
              .subscribe((res: any) => {
                if (res.data == null) {
                  this.opt.options = [];
                } else {
                  this.dataService.buildOptions(res, this.opt);
                }
                if (this.field.props.attribute) {
                  //if the data in array of object
                  let data = this.field.key
                    .split(".")
                    .reduce((o: any, i: any) => o[i], this.model);
                  this.field.formControl.setValue(data);
                } else {
                  this.field.formControl.setValue(this.model[this.field.key]);
                }
              });
          }
        });
      };
    }
  }

  selectionChange(selectedObject: any) {
    // if (selectedObject && this.opt.onValueChangeUpdate && this.opt.onValueChangeUpdate instanceof Array) {
    //   for (const obj of this.opt.onValueChangeUpdate) {
    //     this.field.formControl.parent.controls[obj.key].setValue(
    //       selectedObject[obj.valueProp]
    //     );
    //   }

    // }
    if (this.opt.onValueChangeUpdate) {
      this.field.form.controls[this.opt.onValueChangeUpdate.key].setValue(
        selectedObject[this.opt.onValueChangeUpdate.key]
      );
      selectedObject = {};
    } 
    if(this.opt.Child){
      console.log(this.field.props.options);
      var values:any =this.field.props.options
      let selectedvalues:any=this.model[this.opt.changesfield]
      // const data = values.foreach((vals: any) => {
      //   // return { label: name.model_name, value: name.model_name };        
      //   if(vals.name==selectedvalues){
      //     return vals
      //   }
      // });
      const data = values.filter((vals: any) => {
        return vals.field_name === selectedvalues;
      });
      
      if(data[0].reference){
        this.dataService.getDataByFilter(data[0].orbitalvaule.collection_name,{}).subscribe((xyz:any)=>{
          console.log(xyz);
          const unmatchedNames = xyz.data[0].response;

        // Update the options array within the subscription
        this.field.parent.fieldGroup[2].props.options= unmatchedNames.map((name: any) => {
          return { label: name.name, id: name[data[0].orbitalvaule.field] };
        });
        })
      }
      console.log(data);
this.model['orbital']=true
console.log(this.opt);
console.log(this.model);
console.log(this.field.parent.fieldGroup[2].props.options);

console.log((!this.model.field && !this.model.operator) ||this.model.orbital);

    }
  }

  subscribeOnValueChangeEvent() {
    // on ParentKey changes logic to be implemented
    if (this.field.parentKey! != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.field.parentKey); //this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          this.selectedObject = val;
        });
      };
    }
    if (this.field.key === "modelName") {
      let model_name = sessionStorage.getItem("model_name");
      console.log(model_name);
     console.log(this.field);
     var filterCondition1 =
      {filter: [
      {
       clause: "AND",
       conditions: [
        { column: 'model_name', operator: "NOTEQUAL", value: model_name },
       ]
      }
      ]}
      // model_config
      //! to chnage 
      // this.dataService.getotherModuleName(model_name)
      this.dataService.getDataByFilter('model_config',filterCondition1)
      .subscribe((abc: any) => {
        console.log(abc);
        
        const unmatchedNames = abc.data[0].response;

        // Update the options array within the subscription
        this.field.props.options = unmatchedNames.map((name: any) => {
          return { label: name.model_name, value: name.model_name };
        });
        this.optionsValue = this.field.props.options;
        console.log(this.optionsValue)
      });
    }
   

  }
}
// Sample json
// {
// "type": "select-input",
// "key": "org_id",
// "className": "flex-6",
// "props": {
// "label": "Organizatiom",
// "labelPropTemplate": "{{org_name}}",
// "optionsDataSource": {
// "collectionName": "organisation"
// },
// "labelProp": "org_name",
// "valueProp": "_id",
// "required": true
// },"expressions": {
// "hide": "(model.access !=='SA')"
// }
// }