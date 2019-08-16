// Copyright (c) 2019, avu developer and contributors
// For license information, please see license.txt

// Rafik created doctype
var emp = []
var id = []
frappe.ui.form.on('Employee Site ID', {
	refresh: function(frm) {
		cur_frm.set_query("site_name", function() {
			return {
				"filters": {
					"docstatus":1
				}
			};
		});
		if(!cur_frm.doc.year){
			var d = new Date();
			var r = d.getFullYear()
			var yer = r.toString()
			cur_frm.set_value("year",yer);
		}
	},
	// update employee status in child table -Suvarna
	employee_id_status:function()
	{
		// frappe.msgprint("hii")
		if(cur_frm.doc.employee_id_status ){
            $.each(cur_frm.doc.employee_details, function (i, v) {
                frappe.model.set_value(v.doctype, v.name, "employee_id_status", cur_frm.doc.employee_id_status)
            });
		}
		else{
			$.each(cur_frm.doc.employee_details, function (i, v) {
                frappe.model.set_value(v.doctype, v.name, "employee_id_status", undefined)
            });
		}
	},
	validate: function(frm,cdt,cdn){
		var naming_series = cur_frm.doc.company_abbr+"-ESD-"+cur_frm.doc.year+"-"
		cur_frm.set_value("naming_series",naming_series)
		// for(var i=0;i<cur_frm.doc.employee_details.length;i++){
		// 	var doct = cur_frm.doc.employee_details[i].doctype
		// 	var name = cur_frm.doc.employee_details[i].name
		// 	if(cur_frm.doc.employee_details[i].id_no && cur_frm.doc.site_name){
		// 		frappe.call({
		// 			method:"check_id",
		// 			args: {"id":cur_frm.doc.employee_details[i].id_no},
		// 			doc:frm.doc, 
		// 			callback: function(w) {
		// 				if(w.message != undefined){
		// 					// frappe.model.set_value(doct,name,"id_no",undefined);
		// 					frappe.throw("Id Number "+w.message[0]['id_no']+" Already Taken by"+" "+w.message[0]['employee_id'])
		// 					frappe.validate = false
		// 					return false
		// 				}else{
		// 				// 	for (var i=0;i<cur_frm.doc.employee_details.length;i++){
		// 				// 		if(cur_frm.doc.employee_details[i].id_no in id ){
		// 				// 			frappe.model.set_value(doct,name,"id_no",undefined);
		// 				// 			frappe.throw("ID Number Selected Already")
		// 				// 		}
		// 				// 	}
		// 				// 	id.push(cur_frm.doc.employee_details[i].id_no)
		// 				}
		// 			}
		// 		})
		// 	}
		// 	frappe.model.set_value(doct,name,"active",undefined);
		// }
	},
	on_submit: function(frm){
		if(cur_frm.doc.employee_details.length<=0){
			frappe.throw("Add At least One Employee ");
		}else{
			var date = new Date()
			date.setHours(5,30,0,0);
			var now_date = Date.parse(date)
			for (var i=0;i<cur_frm.doc.employee_details.length;i++){
				if(cur_frm.doc.employee_details[i].id_start_date && cur_frm.doc.employee_details[i].id_expiry_date){
					var start = Date.parse(cur_frm.doc.employee_details[i].id_start_date);
					var end = Date.parse(cur_frm.doc.employee_details[i].id_expiry_date);
					if (now_date >= start && now_date <= end){
						cur_frm.doc.employee_details[i].active = 1
					}else{
						cur_frm.doc.employee_details[i].active = 0
					}
				}	
			}
		}
		
	},
	site_name: function(frm){
		if(!cur_frm.doc.site_name){
			cur_frm.set_value("location","");
			cur_frm.set_value("company","");
			cur_frm.set_value("site_id_type","");
			if(cur_frm.doc.company_abbr || cur_frm.doc.employee_details){
				cur_frm.set_value("company_abbr","");
				cur_frm.set_value("employee_details",[]);
			}
			emp = [];
			id = [];
		}else{
			emp = [];
			id = [];
			frappe.call({
				method:"frappe.client.get_value",
				args: {
					doctype:"Site Master",
					filters: {
						name:cur_frm.doc.site_name
					},
					fieldname:["location", "company" ,"site_id_type"]
				}, 
				callback: function(r) {
					var data = r.message
					cur_frm.set_value("location",data['location']);
					cur_frm.set_value("company",data['company']);
					cur_frm.set_value("site_id_type",data['site_id_type']);
					if(data['company']){
						frappe.call({
							method:"frappe.client.get_value",
							args: {
								doctype:"Company",
								filters: {
									name:data['company']
								},
								fieldname:["series"]
							}, 
							callback: function(w) {
								cur_frm.set_value("company_abbr",w.message['series']);
							}
						})
					}
				}
			})
		}
	},
	setup: function(frm){
		if(!cur_frm.doc.employee_details){
			emp = [];
			id = [];
		}
	}
});
frappe.ui.form.on('Employee Site Child', {
	
	employee_details_remove: function(frm){
		emp = [];
		id = [];
	},
	id_start_date:function(frm,cdt,cdn){
		common_code(frm,cdt,cdn);
		// check_date_emp(frm,cdt,cdn);
	},
	id_expiry_date: function(frm,cdt,cdn){
		common_code(frm,cdt,cdn);
		// check_date_emp(frm,cdt,cdn);
	},
	id_no: function(frm,cdt,cdn){
		var child = locals[cdt][cdn]
		// if(child.id_no){
		// 	frappe.call({
		// 		method:"check_id",
		// 		args: {"id":child.id_no},
		// 		doc:frm.doc, 
		// 		callback: function(w) {
		// 			if(w.message){
		// 				// frappe.model.set_value(child.doctype, child.name,"id_no",undefined);
		// 				// child.id_no = ""
		// 				// cur_frm.refresh_field("employee_details")
		// 				frappe.throw("Id Number "+w.message[0]['id_no']+" Already Taken by"+" "+w.message[0]['employee_id'])
		// 			}else{
		// 				for (var i=0;i<cur_frm.doc.employee_details.length;i++){
		// 					if(id.includes(child.id_no)){
		// 						frappe.model.set_value(child.doctype, child.name,"id_no",undefined);
		// 						frappe.throw("ID Number Selected Already")
		// 					}
		// 				}
		// 				id.push(child.id_no)
		// 			}
		// 		}
		// 	})
		// }
	},
	employee_id: function(frm,cdt,cdn){
		// emp = []
		// var child = locals[cdt][cdn]
		// if(child.employee_id){
		// 	for (var i=0;i<cur_frm.doc.employee_details.length;i++){
		// 		if(emp.includes(child.employee_id)){
		// 			frappe.model.set_value(child.doctype, child.name,"employee_id",undefined);
		// 			frappe.throw("Employee Selected Already")
		// 		}
		// 	}
		// 	emp.push(child.employee_id);
		// 	check_date_emp(frm,cdt,cdn);
		// }else{
		// 	frappe.model.set_value(child.doctype, child.name,"employee_name",undefined);
		// }
	},
	// update employee status in child table -Suvarna
	employee_details_add:function(frm,cdt,cdn)
	{
		if(cur_frm.doc.employee_id_status )
		{
			var employee_details_row = locals[cdt][cdn]
		console.log(employee_details_row.employee_id_status)
		employee_details_row.employee_id_status = cur_frm.doc.employee_id_status
		cur_frm.refresh_field("employee_details")
		}
		
		
	}

});
function common_code(frm,cdt,cdn){
	var child = locals[cdt][cdn]
	if(child.id_start_date && child.id_expiry_date){
		if(child.id_start_date>child.id_expiry_date){
			frappe.model.set_value(child.doctype, child.name,"id_expiry_date","");
			frappe.throw("Start Date Cannot be less than Expiry Date");
		}
	}
}
function check_date_emp(frm,cdt,cdn){
	var child = locals[cdt][cdn]
	console.log("child")
	if(child.id_start_date && child.id_expiry_date && child.employee_id){
		frappe.call({
			method:"validate_date",
			doc:frm.doc,
			args:{
				"emp":child.employee_id,
				"start":child.id_start_date,
				"end":child.id_expiry_date
			},
			callback: function(r){
				if(r.message != "No Data"){
					frappe.model.set_value(child.doctype, child.name,"id_expiry_date",undefined);
					frappe.model.set_value(child.doctype, child.name,"id_start_date",undefined);
					frappe.throw("Employee Already Active for Site"+" "+cur_frm.doc.site_name+" "+"For Mentioned Date");
				}
			}
		})
	}
}
