// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Expense Voucher Entry', {
	setup:function(frm){
		//Rafik -- For Flitering child Table Cost center based on Company
		cur_frm.fields_dict["expense_voucher_entry_table_new"].grid.get_field("cost_center").get_query = function(frm)
		{
			return {
				filters:{
						'company': cur_frm.doc.company,
						'is_group': 0
					}
				}
		}
			
		cur_frm.set_query('project', function () {
			return {
				filters: {
					'company': cur_frm.doc.company,
					'docstatus': 0
				}
			}
		})
		cur_frm.set_query('credit_account', function () {
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0
					
				}
			}
		})
		cur_frm.set_query('debit_account', function () {
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0,
					"account_type": ["not in", ["Tax"]] 
					
				}
			}
		})


		// cur_frm.fields_dict['debit_account'].get_query = function(doc) {
		// 	return {
		// 		filters: [
		// 				  ['Account', 'account_type', 'not in', 'Tax' ],
		// 				  ['Account', 'is_group', '=', 0],
		// 				  ['Company', 'company_name', '=', cur_frm.doc.company ]
						 
		// 			]
		// 	}
		// }
		
		cur_frm.set_query('taxable_account', function () {
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0,
					'account_type': 'Tax'
				}
			}
		})
		cur_frm.set_query('cost_center', function () {
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0,
				}
			}
		})
	},
	onload:function(frm){
		
		//function to add class to a button
		var stop_loop = setInterval(()=>{
			$(":contains('Add In Row')").closest('button').addClass("btn-primary");
			$(":contains('Add Row')").closest('button').hide();
			$('[data-fieldname="expense_voucher_entry_table_new"] .btn-open-row').on('click',function(e)
			{ 
				// console.log($('[data-fieldname="expense_voucher_entry_table_new"] .btn-open-row'))
				$(":contains('Insert Above')").closest('button').hide();
				$(":contains('Insert Below')").closest('button').hide();
			})
			if($(":contains('Add In Row')").closest('button').addClass("btn-primary")||($('[data-fieldname="expense_voucher_entry_table_new"] .btn-open-row').length>=1)){
				clearInterval(stop_loop)
			}
		},100)//end function

		if(cur_frm.doc.__islocal == 1 && cur_frm.doc.amended_from == undefined){
			cur_frm.set_value('expense_voucher_entry_table_new',[])
		}
		if(cur_frm.doc.__islocal == 1 && cur_frm.doc.amended_from != undefined){
			$.each(cur_frm.doc.expense_voucher_entry_table_new, function (i, v) {
                frappe.model.set_value(v.doctype, v.name, "reference_je_entry_id", undefined)
            });
		}
		//to add filter in partytype rohan 
		cur_frm.set_query('party_type', function () {
			return {
				filters: [
					["DocType","name", "in",[ "Supplier","Customer","Employee","Member","Shareholder","Student"]]
				]
				
			}
		})
		
	},//end

	// To clear asset name when asset id is cleared By Natty
    asset:function(frm){
        // console.log('in')
        if(cur_frm.doc.asset==undefined){
            cur_frm.set_value('asset_name','')
        }
	},
	// fill ref. date same as voucher date by suvarna
	voucher_date:function(frm)
	{
		if(cur_frm.doc.voucher_date)
		{
			cur_frm.set_value("reference_date",cur_frm.doc.voucher_date)
		}
	},
	employee:function(frm){
        // console.log('in')
        if(cur_frm.doc.employee==undefined){
            cur_frm.set_value('employee_name','')
        }
	},
	party_type:function(frm){
		// -------------commented by jagdish ----------------------
		// if(cur_frm.doc.party_type == undefined){
			cur_frm.set_value('party',undefined)
		// }
		cur_frm.trigger('vat_fetch')
	},
	party:function(frm){
		cur_frm.trigger('vat_fetch')
		if(!cur_frm.doc.party){
			cur_frm.set_value('supplier',undefined)
		}
	},
	//----- Jagdish-------------
	vat_fetch: function(frm){
		if(cur_frm.doc.party_type && cur_frm.doc.party && ['Supplier','Customer'].includes(cur_frm.doc.party_type)){
			// cur_frm.add_fetch('party','tax_id','vat_number');
			frappe.call({
				method: "frappe.client.get_value",
				args: {
					doctype: cur_frm.doc.party_type,
					// fieldname: dt.party_type=='Customer' ? 'customer_name' : 'supplier_name',
					fieldname : ['tax_id'],
					filters: { name: cur_frm.doc.party },
				},
				callback: function(r, rt) {
					if(r.message) {
						cur_frm.set_value('vat_number', r.message.tax_id);
					}
					else{
						cur_frm.set_value('vat_number',undefined);
					}
				}
			});
		}
		else{
			cur_frm.set_value('vat_number',undefined);
		}
	},
	//--------------------------
	refresh: function (frm) {
		// suvarna..fill onload reference date
		// if(cur_frm.doc.__islocal)
		// {
		// 	if(cur_frm.doc.voucher_date)
		// 		{
		// 			cur_frm.set_value("reference_date",cur_frm.doc.voucher_date)
		// 		}
		// }
		//Rafik -- For Flitering child Table Cost center based on Company
		
		if (cur_frm.doc.__islocal == 1) {
			//add current year by suvarna for the naming series
			var current_year=moment().format('YYYY')
            cur_frm.set_value("current_year",current_year)
			cur_frm.set_value('journal_entry_link', undefined)
			cur_frm.set_value('voucher_number', undefined)
			
		}
			
		
		// to make fields read only if excluded tax is checked or unchecked -- Natty
		if(cur_frm.doc.exclude_tax==1){
			cur_frm.set_df_property('debit', 'read_only', 1)
			cur_frm.set_df_property('credit', 'read_only', 0)
		}
		else{
			cur_frm.set_df_property('debit', 'read_only', 0)
			cur_frm.set_df_property('credit', 'read_only', 1)
		}
		if(cur_frm.doc.docstatus == 1){
			cur_frm.set_df_property('debit', 'read_only', 1)
		}
		 // read only company if draft --by Pranali
			if(!frm.doc.__islocal) {
				frm.set_df_property('company','read_only',1)
			}
		// ------------------------------------------------
		 // Naming Series --by Pranali
			if (cur_frm.doc.__islocal && cur_frm.doc.company_series) {
				// update naming series acc to voucher_type--by Pranali
				cur_frm.trigger("naming_series_code");
			}
			else if(cur_frm.doc.__islocal && !cur_frm.doc.company_series){
				cur_frm.set_value("naming_series",undefined);
			}
        // ------------------------------------------------
	},

	//to check if records are added in child table
	validate: function(frm){
		// console.log("hii")
		if(cur_frm.doc.expense_voucher_entry_table_new.length == 0){
			frappe.throw('Please Add Records in Table to Create Journal Entry')
		}
		cur_frm.trigger('common_program')
		// var login_user_name = frappe.session.user_fullname
		// cur_frm.set_value("created_by",login_user_name)
		//add total of amounts in form.....by suvarna
		var sum_credit_amount=0
		var sum_expense_amount =0
		var sum_vat_amount=0
		if(cur_frm.doc.expense_voucher_entry_table_new)
		{
			for(var i=0;i<cur_frm.doc.expense_voucher_entry_table_new.length;i++)
				{
					
					sum_credit_amount=sum_credit_amount+cur_frm.doc.expense_voucher_entry_table_new[i].credit_amount
					sum_expense_amount = sum_expense_amount+cur_frm.doc.expense_voucher_entry_table_new[i].expense_amount
					sum_vat_amount = sum_vat_amount+cur_frm.doc.expense_voucher_entry_table_new[i].vat_amount
				}
				cur_frm.set_value("total_credit_amount",sum_credit_amount)
				cur_frm.set_value("total_expense_amount",sum_expense_amount)
				cur_frm.set_value("total_vat_amount",sum_vat_amount)
		}
		frm.trigger('naming_series_code');
		
	},
	naming_series_code: function(frm){
		// Naming Series --by Pranali
       
		if (cur_frm.doc.__islocal){
            var year= moment().format('YYYY');
            var series;
            series=cur_frm.doc.company_series+"-EV-"+year+"-";
            cur_frm.set_value("naming_series",series);

        }
         
         // ------------------------------------------------
	},
	credit: function (frm) {
		//to check negative amount
		if (cur_frm.doc.credit < 0) {
			cur_frm.set_value('credit', 0)
			frappe.throw('Credit Amount Cannot be Negative Amount')
		}
		if(cur_frm.doc.credit == undefined || cur_frm.doc.credit == 0){
			cur_frm.set_value('debit', 0)
		}
		common_calc(frm)
	},

	debit:function(frm){
		//to check negative amount
		if (cur_frm.doc.debit < 0) {
			cur_frm.set_value('debit', 0)
			frappe.throw('Expense Amount Cannot be Negative Amount')
		}		
		if(cur_frm.doc.debit == undefined || cur_frm.doc.debit == 0){
			cur_frm.set_value('credit', 0)
		}
		common_calc(frm)
	},

	vat_percentage: function (frm) {
		common_calc(frm)
	},

	exclude_tax:function(frm){
		if(cur_frm.doc.exclude_tax==1){
			cur_frm.set_df_property('debit', 'read_only', 1)
			cur_frm.set_df_property('credit', 'read_only', 0)
			cur_frm.set_value('credit', 0.0)
			cur_frm.set_value('debit',  0.0)
			cur_frm.set_value('vat',  0.0)
		}
		else{
			cur_frm.set_df_property('debit', 'read_only', 0)
			cur_frm.set_df_property('credit', 'read_only', 1)
			cur_frm.set_value('credit', 0.0)
			cur_frm.set_value('debit',  0.0)
			cur_frm.set_value('vat',  0.0)
		}
	},
	
	taxable_account: function (frm) {
		if (cur_frm.doc.taxable_account == undefined) {
			cur_frm.set_value('vat_percentage', undefined)
			cur_frm.set_value('debit', 0)
		}
		
	},

	company: function (frm) {
		cur_frm.trigger('common_program')
		cur_frm.set_value('credit_account', undefined)
		cur_frm.set_value('reference_number', undefined)
		cur_frm.set_value('reference_date', undefined)
		// cur_frm.set_query('party', function () {
		// 	return {
		// 		filters: {
		// 			'company': cur_frm.doc.company
		// 		}
		// 	}
		// })
		
		 // naming series handling by pranali------------------------------------------------
		 if (!cur_frm.doc.company) {
            // empty company Series if company empty --by Pranali
            cur_frm.set_value("company_series", undefined)
            cur_frm.set_value("naming_series", undefined)
        }
        else if (cur_frm.doc.__islocal && cur_frm.doc.company_series) {
            // update naming series acc to company--by Pranali
            cur_frm.trigger("naming_series_code");
        }
          // ------------------------------------------------
	},


	//to add main doctype data in child table
	add_row: function(frm){
		var stop_loop = setInterval(()=>{
			$('[data-fieldname="expense_voucher_entry_table_new"] .btn-open-row').on('click',function(e)
			{ 
				// console.log($('[data-fieldname="expense_voucher_entry_table_new"] .btn-open-row'))
				$(":contains('Insert Above')").closest('button').hide();
				$(":contains('Insert Below')").closest('button').hide();
			})
			if(($('[data-fieldname="expense_voucher_entry_table_new"] .btn-open-row').length>=1)){
				clearInterval(stop_loop)
			}
		},100)

		var company = cur_frm.doc.company
		var ref_num = cur_frm.doc.reference_number
		var ref_date = cur_frm.doc.reference_date
		var voucher_date = cur_frm.doc.voucher_date
		var credit_account = cur_frm.doc.credit_account
		var cost_center = cur_frm.doc.cost_center
		var debit_account = cur_frm.doc.debit_account

		if(company != undefined && ref_num != undefined && ref_date != undefined && voucher_date != undefined && credit_account != undefined && cost_center != undefined && debit_account != undefined){
			if(cur_frm.doc.credit != 0 || cur_frm.doc.debit != 0){
				var row = cur_frm.fields_dict["expense_voucher_entry_table_new"].grid.add_new_row()
				frappe.model.set_value(row.doctype, row.name, "company", cur_frm.doc.company)
				frappe.model.set_value(row.doctype, row.name, "company_series", cur_frm.doc.company_series)
				frappe.model.set_value(row.doctype, row.name, "cost_center", cur_frm.doc.cost_center)
				frappe.model.set_value(row.doctype, row.name, "reference_invoice_number", cur_frm.doc.reference_number)
				frappe.model.set_value(row.doctype, row.name, "reference_date", cur_frm.doc.reference_date)
				frappe.model.set_value(row.doctype, row.name, "voucher_date", cur_frm.doc.voucher_date)
				frappe.model.set_value(row.doctype, row.name, "project", cur_frm.doc.project)
				frappe.model.set_value(row.doctype, row.name, "credit_account", cur_frm.doc.credit_account)
				frappe.model.set_value(row.doctype, row.name, "employee", cur_frm.doc.employee)
				frappe.model.set_value(row.doctype, row.name, "employee_name", cur_frm.doc.employee_name)
				frappe.model.set_value(row.doctype, row.name, "asset", cur_frm.doc.asset)
				frappe.model.set_value(row.doctype, row.name, "asset_name", cur_frm.doc.asset_name)
				frappe.model.set_value(row.doctype, row.name, "party_type", cur_frm.doc.party_type)
				frappe.model.set_value(row.doctype, row.name, "party", cur_frm.doc.party)
				frappe.model.set_value(row.doctype, row.name, "supplier", cur_frm.doc.supplier)
				frappe.model.set_value(row.doctype, row.name, "narration", cur_frm.doc.remarks)
				frappe.model.set_value(row.doctype, row.name, "exclude_tax", cur_frm.doc.exclude_tax)
				frappe.model.set_value(row.doctype, row.name, "vat_number", cur_frm.doc.vat_number)
				frappe.model.set_value(row.doctype, row.name, "credit_amount", cur_frm.doc.credit)
				if(cur_frm.doc.taxable_account != undefined) {
					frappe.model.set_value(row.doctype, row.name, "expense_account", cur_frm.doc.debit_account)
					frappe.model.set_value(row.doctype, row.name, "vat_account", cur_frm.doc.taxable_account)
					frappe.model.set_value(row.doctype, row.name, "expense_amount", cur_frm.doc.debit)
					frappe.model.set_value(row.doctype, row.name, "vat_amount", cur_frm.doc.vat)
					frappe.model.set_value(row.doctype, row.name, "vat_percentage", cur_frm.doc.vat_percentage)
				}
				else {
					frappe.model.set_value(row.doctype, row.name, "expense_account", cur_frm.doc.debit_account)
					frappe.model.set_value(row.doctype, row.name, "expense_amount", cur_frm.doc.credit)
				}
				cur_frm.refresh_fields()
				cur_frm.trigger('common_program')
			} else {
				frappe.throw('Please Enter Valid Amount')
			}
		}else {
			var reqd_field_list = '<ul><li>Company</li><li>Reference Date</li><li>Reference Number</li><li>Credit To Account</li><li>Amount</li><li>Expense Account</li><li>Cost Center</li><li>Expense Amount</li><ul>'
			frappe.throw('Please Fill Required Fields <br>'+reqd_field_list);
		}
		
	},

	//function to clear fields
	common_program: function (frm) {
		cur_frm.set_value('project', undefined)
		cur_frm.set_value('debit_account', undefined)
		cur_frm.set_value('taxable_account', undefined)
		cur_frm.set_value('cost_center', undefined)
		cur_frm.set_value('credit', 0)
		cur_frm.set_value('debit', 0)
		cur_frm.set_value('vat_percentage', undefined)
		cur_frm.set_value('employee',undefined)
		cur_frm.set_value('asset',undefined)
		cur_frm.set_value('vat_number',undefined)
		cur_frm.set_value('supplier',undefined)
		cur_frm.set_value('exclude_tax',undefined)
		cur_frm.set_value('party_type',undefined)
		cur_frm.set_value('remarks',undefined)
	},
		
});


//calculate debit amount if vat account is selected and on excluded checkbox
function common_calc(frm) {
	if(cur_frm.doc.exclude_tax==1){
		if (cur_frm.doc.credit) {
			if (cur_frm.doc.vat_percentage == 0 || cur_frm.doc.vat_percentage == undefined) {
				cur_frm.set_value('vat', 0)
				cur_frm.set_value('debit', cur_frm.doc.credit)
			} else {
				var credit = cur_frm.doc.credit
				var v_per = cur_frm.doc.vat_percentage
				var total_per = 100 + v_per
				var debit = (credit / total_per) * 100
				var v_amt = credit - debit
				cur_frm.set_value('vat', v_amt)
				cur_frm.set_value('debit', debit)
				cur_frm.set_df_property('debit', 'read_only', 1)
			}
		} else {
			cur_frm.set_value('vat', undefined)
			if(cur_frm.doc.taxable_account != undefined){
				cur_frm.set_value('debit', 0)
			}
			// cur_frm.set_df_property('debit', 'read_only', 0)
		}
		// cur_frm.refresh()
	}
	else{
		if (cur_frm.doc.debit) {
			if (cur_frm.doc.vat_percentage == 0 || cur_frm.doc.vat_percentage == undefined) {
				cur_frm.set_value('vat', 0)
				cur_frm.set_value('credit', cur_frm.doc.debit)
			} else {
				var debit = cur_frm.doc.debit
				var v_per = cur_frm.doc.vat_percentage
				var v_amt = (debit * v_per) / 100
				var credit = debit + v_amt
				cur_frm.set_value('vat', v_amt)
				cur_frm.set_value('credit', credit)
				cur_frm.set_df_property('credit', 'read_only', 1)
			}
		} else {
			cur_frm.set_value('vat', undefined)
			if(cur_frm.doc.taxable_account != undefined){
				cur_frm.set_value('credit', 0)
			}
			// cur_frm.set_df_property('debit', 'read_only', 0)
		}
		// cur_frm.refresh()
	}
	
}
