// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('VAT Expense Entry', {
	refresh: function(frm) {
		if(cur_frm.doc.__islocal == 1) {
			cur_frm.set_value('journal_entry_link',undefined)
		}
	},
	credit: function(frm) {
		cur_frm.trigger('common_calc')
		if(cur_frm.doc.credit < 0) {
			cur_frm.set_value('credit',undefined)
			frappe.throw('Credit Amount Cannot be Negative Amount')
		}
	},
	vat_percentage: function(frm) {
		// console.log("vat_per")
		cur_frm.trigger('common_calc')
		// cur_frm.add_fetch('taxable_account','tax_rate','vat_percentage')
	},
	common_calc: function(frm) {
		if(cur_frm.doc.credit && cur_frm.doc.vat_percentage >= 0) {
			// console.log(cur_frm.doc.vat_percentage)
			if(cur_frm.doc.vat_percentage == 0){
				// console.log("in")
				cur_frm.set_value('vat', 0)
				cur_frm.set_value('debit', cur_frm.doc.credit)
			}else
			{
			var credit = cur_frm.doc.credit
			var v_per = cur_frm.doc.vat_percentage
			var total_per = 100 + v_per
			// console.log(total_per)
			// console.log(credit)
			// console.log(v_per)
			var debit = (credit / total_per) * 100
			// console.log(debit)
			// frappe.throw(debit)
			var v_amt = credit - debit
			// console.log(v_amt)
			// var debit = credit - v_amt
			cur_frm.set_value('vat', v_amt)
			cur_frm.set_value('debit', debit)
		}
		} else {
			cur_frm.set_value('vat', undefined)
			cur_frm.set_value('debit', undefined)
		}
	},
	taxable_account: function(frm) {
		if(cur_frm.doc.taxable_account != undefined) {
			frappe.call({
				method:"frappe.client.get_value",
				args: {
					doctype:"Account",
					filters: {
						name:cur_frm.doc.taxable_account
					},
					fieldname:["tax_rate"]
				}, 
				callback: function(r) {
					var data = r.message
					cur_frm.set_value('vat_percentage', data.tax_rate);
				}
			})
		}
	},
	company: function (frm) {
		cur_frm.trigger('common_code')
		cur_frm.set_query('project', function(){
			return {
				filters: {
					'company': cur_frm.doc.company
				}
			}
		})
		cur_frm.set_query('credit_account', function(){
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0
				}
			}
		})
		cur_frm.set_query('debit_account', function(){
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0
				}
			}
		})
		cur_frm.set_query('taxable_account', function(){
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0,
					'account_type': 'Tax'
				}
			}
		})
		cur_frm.set_query('cost_center', function(){
			return {
				filters: {
					'company': cur_frm.doc.company,
					'is_group': 0,
				}
			}
		})
	},
	common_code:function (frm) {
		cur_frm.set_value('project',undefined)
		cur_frm.set_value('credit_account',undefined)
		cur_frm.set_value('debit_account',undefined)
		cur_frm.set_value('taxable_account',undefined)
		cur_frm.set_value('cost_center',undefined)
		cur_frm.set_value('reference_number',undefined)
		cur_frm.set_value('reference_date',undefined)
		cur_frm.set_value('credit',undefined)
		cur_frm.set_value('vat_percentage',undefined)
	}
});
