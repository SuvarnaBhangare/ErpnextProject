// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt



// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Upload Mobilization', {
	onload: function(){
		var stop_loop = setInterval(()=>{
			$(":contains('Get Template')").closest('button').addClass("btn-primary");{
				clearInterval(stop_loop)
			}
		},100)
		
			
		

		
		
	},
	refresh: function(frm) {
		// if (cur_frm.doc.mobilization_date == frappe.datetime.get_today()){
		// $(":contains('Cancel')").closest('button').show()
		// }
		// else
		// {
		// 	$(":contains('Cancel')").closest('button').hide()
		// }
		//cur_frm.page.get_inner_group_button(__(Delete)).find("a").addClass("hide");
		//frm.remove_custom_button("Import", 'Menu')
			
			$(":contains('Cancel')").closest('button').hide()
			cur_frm.add_fetch("asset_id","is_equipment","is_equipment")	
			frm.fields_dict['upload_employee_project_allocation_data'].grid.get_field('task').get_query = function(doc, cdt, cdn) 
			{
			var child = locals[cdt][cdn];
						return{	
					filters:[
						['Task', 'is_group', '=', 0],
						['Task', 'project', '=', cur_frm.doc.project]
					]
				}
			}
			cur_frm.set_query("project", function () {
				return {
					filters: {
						"company": cur_frm.doc.company
					}
				}
			})
			cur_frm.set_query("division", function () {
				return {
					filters: {
						"company": cur_frm.doc.company
					}
				}
			})
			cur_frm.set_query("task", function () {
				return {
					filters: {
						"project": cur_frm.doc.project
					}
				}
			})
			cur_frm.fields_dict['mobilization_asset'].grid.get_field('asset_id').get_query = function(doc, cdt, cdn) 
			{
			
						return{	
					filters:[
						['Asset', 'docstatus', '=', 1],
						['Asset', 'is_equipment', '=', 1],
						['Asset', 'asset_status', '=', 'Standby'],
						
						
					]
				}
			}
			cur_frm.fields_dict['upload_employee_project_allocation_data'].grid.get_field('employee').get_query = function(doc, cdt, cdn) 
			{
			
						return{	
					filters:[
						
						['Employee', 'project_status', '=', 'Standby'],
						['Employee', 'status', '=', 'Active']
						
						
					]
				}
			}

			cur_frm.set_query("project", function () {
				return {
					filters: {
						"company": cur_frm.doc.company
					}
				}
			})
			


			cur_frm.set_query("department", function () {
				return {
					filters: {
						"company": cur_frm.doc.company
					}
				}
			})
		var me = this;
		

		if(!cur_frm.doc.__islocal)
		{
			//frappe.msgprint("hii")
			cur_frm.set_df_property("mobilization","read_only",1)
			cur_frm.set_df_property("section_break_2","hidden",1)
		$(cur_frm.fields_dict.upload_html.wrapper).empty();
		// $(cur_frm.fields_dict.csv_head.wrapper).empty()
		
		}
		// else
			if(cur_frm.doc.__islocal)
		{
			
		var $wrapper = $(cur_frm.fields_dict.upload_html.wrapper).empty();
		
		upload($wrapper)
		}
		
		},
	mobilization:function()
	{
		if(cur_frm.doc.mobilization=="Asset")
		{
			// cur_frm.clear_table("upload_employee_project_allocation_data")
			// cur_frm.refresh_fields()
			// cur_frm.set_df_property("project", "reqd", 0)
			cur_frm.set_value("upload_employee_project_allocation_data",undefined)
			cur_frm.set_df_property("upload_employee_project_allocation_data", "reqd", 0)
			cur_frm.set_df_property("mobilization_asset", "reqd", 1)
			cur_frm.set_value("department",undefined)
			cur_frm.set_value("branch",undefined)
			cur_frm.set_value("division",undefined)	
			cur_frm.set_value("task",undefined)
			cur_frm.set_value("project",undefined)
			cur_frm.set_value("shift_type",undefined)
			cur_frm.set_value("start_date",undefined)
			cur_frm.set_value("end_date",undefined)
			
		}
		else
		{
			cur_frm.set_value("mobilization_asset",undefined)
			cur_frm.set_df_property("mobilization_asset", "reqd", 0)
			cur_frm.set_df_property("upload_employee_project_allocation_data", "reqd", 1)
			if(cur_frm.doc.__islocal)
			{
				cur_frm.fields_dict.upload_employee_project_allocation_data.grid.add_new_row()

			}


		}
		var $wrapper = $(cur_frm.fields_dict.upload_html.wrapper).empty();
		upload($wrapper)

		// frappe.msgprint("hiii")
		

	},
	project:function()
	{
		if(cur_frm.doc.mobilization=="Asset")
		{
			if(cur_frm.doc.mobilization_asset)
			{
				for(var i =0;i<cur_frm.doc.mobilization_asset.length;i++)
			{
				frappe.model.set_value("Asset Mobilization", cur_frm.doc.mobilization_asset[i].name
				, "project_name",cur_frm.doc.project)
			}
			}
			
		}
		if(cur_frm.doc.project==undefined || cur_frm.doc.project=="")
		{
			cur_frm.set_value("task",undefined)

		}
	}
	,
	validate:function()
	{	
		if(!cur_frm.doc.__islocal)
		{
		cur_frm.set_df_property("mobilization","read_only",1)
		cur_frm.set_df_property("section_break_2","hidden",1)
		}
		else{
			cur_frm.set_df_property("mobilization","read_only",0)
			cur_frm.set_df_property("section_break_2","hidden",0)

		}
		

	},
	task:function()
	{
		if(cur_frm.doc.task)
        {   
            $.each(cur_frm.doc.upload_employee_project_allocation_data, function (i, v) 
            {
                frappe.model.set_value(v.doctype, v.name, "task", cur_frm.doc.task)
                   
            });
        }
	},
	shift_type:function()
	{
		if(cur_frm.doc.shift_type)
        {   
            $.each(cur_frm.doc.upload_employee_project_allocation_data, function (i, v) 
            {
                frappe.model.set_value(v.doctype, v.name, "shift_name", cur_frm.doc.shift_type)
                   
            });
        }
	},
	start_date:function()
	{
		if(cur_frm.doc.start_date)
        {   
            $.each(cur_frm.doc.upload_employee_project_allocation_data, function (i, v) 
            {
                frappe.model.set_value(v.doctype, v.name, "start_date", cur_frm.doc.start_date)
                   
            });
        }
	},
	end_date:function()
	{
		if(cur_frm.doc.end_date)
        {   
            $.each(cur_frm.doc.upload_employee_project_allocation_data, function (i, v) 
            {
                frappe.model.set_value(v.doctype, v.name, "end_date", cur_frm.doc.end_date)
                   
            });
        }
	},
	
		
	get_template:function() {
			//frappe.msgprint("j")

			if(cur_frm.doc.mobilization=="")
			{
				frappe.throw("<html>Please Select <b>Mobilization Category</b>")
			}
			else
			{
				if(cur_frm.doc.mobilization)
				{
					window.location.href = repl(frappe.request.url +
					'?cmd=%(cmd)s&company=%(company)s&branch=%(branch)s&division=%(division)s&department=%(department)s&designation=%(designation)s&mobilization=%(mobilization)s', 
					{
						cmd: "etos.etos.doctype.upload_mobilization.upload_mobilization.get_template",
						// from_date: this.frm.doc.from_date,
						// to_date: this.frm.doc.to_date,
						company :cur_frm.doc.company,
						branch : cur_frm.doc.branch,
						division: cur_frm.doc.division,
						department: cur_frm.doc.department,
						designation: cur_frm.doc.designation,
						mobilization:cur_frm.doc.mobilization,
						// args :{"mob":cur_frm.doc.mobilization}

	
	
	
				});
			}
			
			}
	
		},
		// scheduler_name: function(frm,cdt,cdn) 
		// {
		// 	var row=locals[cdt][cdn]
		// 	console.log(row.end_date)
		// 	// frappe.msgprint("hiii")
		// 	frappe.call({
		// 		method: "etos.etos.doctype.upload_mobilization.upload_mobilization_scheduler.schedule_emp",
		// 		args :{"end_date":row.end_date},			
		// 		callback: function (r) 
		// 		{
		// 		}
		// 	});			
		// },
		// scheduler_asset: function(frm){
		// 	frappe.call({
		// 		method: "etos.etos.doctype.upload_mobilization.upload_mobilization_scheduler.schedule_asset",
		// 		args :{},			
		// 		callback: function (r) 
		// 		{
		// 		}
		// 	});	
		// }

});

frappe.ui.form.on('Upload Mobilization Data', {
	from_shift_date: function(frm,cdt,cdn) 
	{
		var child = locals[cdt][cdn]
		var from_shift_date = moment(child.from_shift_date)
		var to_shift_date = moment(child.to_shift_date)
		//console.log(from_shift_date)
	if(child.from_shift_date && child.to_shift_date )
	{

			if (from_shift_date > to_shift_date) 
			{
				frappe.msgprint
				({
						title: __("You can not select Future Date"),
						message: __("From Shift Date  should be less than To shift Date"),
						indicator: "red"
				})
			}
	}
		
	},
	to_shift_date:function(frm,cdt,cdn) 
	{
		var child = locals[cdt][cdn]
		var from_shift_date = moment(child.from_shift_date)
		var to_shift_date = moment(child.to_shift_date)
		//console.log(from_shift_date)
	if(child.from_shift_date && child.to_shift_date )
	{

			if (from_shift_date > to_shift_date) 
			{
				frappe.msgprint
				({
						title: __("You can not select Future Date"),
						message: __("From Shift Date  should be less than To shift Date"),
						indicator: "red"
				})
			}
	}
	},
	upload_employee_project_allocation_data_add:function(frm,cdt,cdn)
	{
		var row =locals[cdt][cdn]
      
		//   console.log(row.description)
	
		if(cur_frm.doc.task || cur_frm.doc.shift_type || cur_frm.doc.start_date || cur_frm.doc.end_date)
		{   
			frappe.model.set_value(row.doctype, row.name, "task", cur_frm.doc.task) 
			frappe.model.set_value(row.doctype, row.name, "shift_name", cur_frm.doc.shift_type)          
			frappe.model.set_value(row.doctype, row.name, "start_date", cur_frm.doc.start_date)          
			frappe.model.set_value(row.doctype, row.name, "end_date", cur_frm.doc.end_date)          

		}
		else
		{
			frappe.model.set_value(row.doctype, row.name, "task", undefined) 
			frappe.model.set_value(row.doctype, row.name, "shift_name", undefined)          
			frappe.model.set_value(row.doctype, row.name, "start_date", undefined)          
			frappe.model.set_value(row.doctype, row.name, "end_date", undefined)   
		}
		
		}
	}
)

frappe.ui.form.on('Asset Mobilization', {
	asset_id: function(frm,cdt,cdn) 
	{
		var row =locals[cdt][cdn]
		
		if(row.asset_id)
		{
			frappe.call
			({
				method: "etos.etos.doctype.upload_mobilization.upload_mobilization.assets_value",
				args :{"asset_name":row.asset_id},
			
				callback: function (r) 
				{
					
					// frappe.model.set_value(row.doctype, row.name, "daily_rate", r.message[0].documet_name);
					row.daily_cost = r.message[0].daily_cost
					row.daily_rate = r.message[0].daily_rate
					// console.log(row.daily_cost )
				 
					
				}
				});
		
		}
		
	},
	mobilization_asset_add:function(frm,cdt,cdn)
	{  
		// frappe.msgprint("hii")
		var row =locals[cdt][cdn]
		row.project_name = cur_frm.doc.project

	}
})





 function upload($wrapper)
 {
	frappe.upload.make
	({
		parent: $wrapper,
		// freeze: true,
		// freeze_message: __("Excel Data Importing..."),
		
		args: {
			
			method: 'etos.etos.doctype.upload_mobilization.upload_mobilization.upload',
			args:{
				'mobilize_category':cur_frm.doc.mobilization ? cur_frm.doc.mobilization : null ,
				
			},
			freeze: true,
			freeze_message: __("Ecxel Data Importing .."),
			async: false
			},
		no_socketio: true,
		sample_url: "e.g. http://example.com/somefile.csv",
		callback: function(attachment, r) 
			{	
				frappe.call({
					method: "etos.etos.doctype.upload_mobilization.upload_mobilization.freeze_message_with_time",
					args:{"t":3},
					//   freeze: true,
					freeze_message: __("Data Importing..."),
					callback: function (r) {
						// frappe.msgprint("Data Inserted successfully")
						$("#wholetable").show();
					}
					});
			
				cur_frm.clear_table("upload_employee_project_allocation_data")
				cur_frm.refresh_field("upload_employee_project_allocation_data")
				//console.log("pp",r)
				var data = r.message
				console.log(data)
				if(data)
				{
					if(cur_frm.doc.mobilization=="Employee")
					{
						cur_frm.set_value("upload_employee_project_allocation_data",data)

					}
				if(cur_frm.doc.mobilization=="Asset")
				{
					cur_frm.set_value("mobilization_asset",data)
				}

			}
		}	
	});
	$(":contains('Attach')").closest('button').addClass("btn-primary");

 }

 



 









 