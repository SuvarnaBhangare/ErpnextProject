// // Copyright (c) 2018, Digitalprizm and contributors
// // For license information, please see license.txt

frappe.ui.form.on('Employee Data Changes', {
    employee: function(frm) 
    {
		// frappe.msgprint("hie")
        if(cur_frm.doc.employee)
		    frappe.call({
			method: "etos.etos.doctype.employee_data_changes.employee_data_changes.store_val",
			args: {
                
                "employee":cur_frm.doc.employee

				// "cell_number": cur_frm.doc.modify_cell_number,
				// // "cell_num":cur_frm.doc.cell_number
				// "marital_status":cur_frm.doc.modify_marital_status,
				// // "permanat_address":cur_frm.doc.modify_permanent_address,
				// "current_address":cur_frm.doc.modify_current_address,
				// "emergancy_contact":cur_frm.doc.modify_emergency_contact,
                // "emergancy_phone":cur_frm.doc.modify_emergency_phone,
               
            },
            
			
            callback: function (r) 
            {
               console.log(r)
               cur_frm.fields_dict["family"].grid.remove_all()
                for(var i=0;i<r.message.length;i++)
		            {   
                        var row = cur_frm.fields_dict.family.grid.add_new_row();
                        frappe.model.set_value(row.doctype, row.name, "ref", r.message[i].name);
                        frappe.model.set_value(row.doctype, row.name, "member_name", r.message[i].member_name);
                        frappe.model.set_value(row.doctype, row.name, "gender", r.message[i].gender);
                        frappe.model.set_value(row.doctype, row.name, "date_of_birth", r.message[i].date_of_birth);
                        frappe.model.set_value(row.doctype, row.name, "relation", r.message[i].relation);
                        frappe.model.set_value(row.doctype, row.name, "passport_number", r.message[i].passport_number);
                        frappe.model.set_value(row.doctype, row.name, "valid_up_to", r.message[i].valid_up_to);
                        frappe.model.set_value(row.doctype, row.name, "iqama_no", r.message[i].iqama_no);
                        frappe.model.set_value(row.doctype, row.name, "insurance_membership_no", r.message[i].insurance_membership_no);
                        frappe.model.set_value(row.doctype, row.name, "policy_no", r.message[i].policy_no);
                        frappe.model.set_value(row.doctype, row.name, "insurance_class", r.message[i].insurance_class);
                        frappe.model.set_value(row.doctype, row.name, "insurance_issue_date", r.message[i].insurance_issue_date);
                        frappe.model.set_value(row.doctype, row.name, "insurance_expiry_date", r.message[i].insurance_expiry_date);
                        frappe.model.set_value(row.doctype, row.name, "insurance_approval_limit", r.message[i].insurance_approval_limit);
                        
                        frm.refresh_field('cristal_template');
			        }

			}
		});
		

        },
        refresh:function()
        {
    
            cur_frm.set_df_property("modify_birth_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_cell_number", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_subway_university_number", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_preferred_contact_email", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_personal_email", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            
            cur_frm.set_df_property("modify_company_email", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_marital_status", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_permanent_address", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_current_address", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_emergency_contact", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_emergency_phone", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("national_id_no", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("iqama_no", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            // cur_frm.set_df_property("family", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_national_id_no", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_iqama_no", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_iqama_issue_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_iqama_expiry_hijri", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_passport_number", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_date_of_issue", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_valid_upto_english", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_driving_license_no", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_driving_license_issue_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_driving_license_expiry_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_baladiya_card_no", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_exam_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            cur_frm.set_df_property("modify_training_expiry_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);
            // cur_frm.set_df_property("modify_exam_date", "read_only", cur_frm.doc.__islocal ? 0 : 1);

        },
        on_submit:function()
        {
            cur_frm.set_read_only()
        }
    
});

