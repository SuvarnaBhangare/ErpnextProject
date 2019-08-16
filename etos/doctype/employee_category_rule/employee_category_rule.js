// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Employee Category Rule', {
	refresh: function(frm) {

	},
	ot_applicable:function(frm){
		if (cur_frm.doc.ot_applicable){
			if (cur_frm.doc.ot_applicable == "Yes"){
				cur_frm.set_value("normal_ot_factor", "");
				cur_frm.set_value("holiday_ot_factor", "");
				cur_frm.set_value("un_authorized_absent_deduction", "");
				cur_frm.set_df_property("normal_ot_factor","reqd",1)
				cur_frm.set_df_property("holiday_ot_factor","reqd",1)
			}else{
				cur_frm.set_df_property("normal_ot_factor","reqd",0)
				cur_frm.set_df_property("holiday_ot_factor","reqd",0)
			}
		}
	},
	validate: function(frm){
		if(cur_frm.doc.normal_ot_factor){
			if(cur_frm.doc.normal_ot_factor<=0){
				frappe.throw("Normal OT Factor Cannot be Less or Equal to Zero")
			}
		}
		if(cur_frm.doc.holiday_ot_factor){
			if(cur_frm.doc.holiday_ot_factor<=0){
				frappe.throw("Holiday OT Factor Cannot be Less or Equal to Zero")
			}
		}
		if(cur_frm.doc.un_authorized_absent_deduction){
			if(cur_frm.doc.un_authorized_absent_deduction<=0){
				frappe.throw("Unauthorized Absent Deduction Days Cannot be Less or Equal to Zero")
			}
		}
		if(cur_frm.doc.absent_penalty_amtperday){
			if(cur_frm.doc.absent_penalty_amtperday<=0){
				frappe.throw("Absent Penalty Amount Per day Cannot be Less or Equal to Zero")
			}
		}
		
		// code to set item status
		
		// if (!frm.doc.__islocal) {
		// 	var item_status = cur_frm.doc.is_disabled
		// 	frappe.call({
		// 		"method": "frappe.client.set_value",
		// 		"args": {
		// 			"doctype": "Item",
		// 			"name": cur_frm.doc.item_ref,
		// 			"fieldname": {
		// 				"disabled": item_status
		// 			}
		// 		}
		// 	});
		// }
	},


	
	// on_save:function(frm){

	// }
});

frappe.ui.form.on("Employee Category Rule", "refresh", function(frm) {
    // use the __islocal value of doc, to check if the doc is saved or not
	frm.set_df_property("normal_ot_factor", "read_only", frm.doc.__islocal ? 0 : 1);
	frm.set_df_property("holiday_ot_factor", "read_only", frm.doc.__islocal ? 0 : 1);
	frm.set_df_property("un_authorized_absent_deduction", "read_only", frm.doc.__islocal ? 0 : 1);
	frm.set_df_property("ot_applicable", "read_only", frm.doc.__islocal ? 0 : 1);
	if(cur_frm.doc.absent_penalty_amtperday){
		frm.set_df_property("absent_penalty_amtperday", "read_only", frm.doc.__islocal ? 0 : 1);
	}
	else{
		frm.set_df_property("absent_penalty_amtperday", "hidden", frm.doc.__islocal ? 0 : 1);
	}
});
