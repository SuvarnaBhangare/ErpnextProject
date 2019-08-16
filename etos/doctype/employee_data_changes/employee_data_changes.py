# -*- coding: utf-8 -*-
# Copyright (c) 2018, Digitalprizm and contributors
# For license information, please see license.txt


from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json

class EmployeeDataChanges(Document):
	def on_submit(self):
		
		
		# if self.modify_valid_upto_english is not None:
		#    modify_valid_upto_english = self.modify_valid_upto_english


		if self.modify_cell_number is not None:
			frappe.db.sql("update `tabEmployee` set cell_number = '"+self.modify_cell_number+"' where employee ='"+self.employee+"' ")

		# if self.modify_subway_university_number is not None:
		# 	frappe.db.sql("update `tabEmployee` set subway_university_number = '"+self.modify_subway_university_number+"' where employee ='"+self.employee+"' ")
		
		if self.modify_preferred_contact_email is not None:
			frappe.db.sql("update `tabEmployee` set prefered_contact_email = '"+self.modify_preferred_contact_email+"' where employee ='"+self.employee+"' ")


		if self.modify_birth_date is not None:
			frappe.db.sql("update `tabEmployee` set date_of_birth = '"+self.modify_birth_date+"' where employee ='"+self.employee+"' ")


		if self.modify_marital_status is not None:
			frappe.db.sql("update `tabEmployee` set marital_status = '"+self.modify_marital_status+"' where employee ='"+self.employee+"' ")

		if self.modify_permanent_address is not None:
			frappe.db.sql("update `tabEmployee` set permanent_address = '"+self.modify_permanent_address+"' where employee ='"+self.employee+"' ")

		if self.modify_current_address  is not None:
			frappe.db.sql("update `tabEmployee` set current_address = '"+self.modify_current_address+"' where employee ='"+self.employee+"' ")	

		if  self.modify_emergency_contact is not None:
			frappe.db.sql("update `tabEmployee` set person_to_be_contacted = '"+ self.modify_emergency_contact+"' where employee ='"+self.employee+"' ")	


		if self.modify_emergency_phone is not None:
			frappe.db.sql("update `tabEmployee` set emergency_phone_number = '"+self.modify_emergency_phone+"' where employee ='"+self.employee+"' ")


		if self.modify_national_id_no is not None:
			frappe.db.sql("update `tabEmployee` set national_id_no = '"+self.modify_national_id_no+"' where employee ='"+self.employee+"' ")	

		if self.modify_iqama_no is not None:
			frappe.db.sql("update `tabEmployee` set iqama_no = '"+self.modify_iqama_no+"' where employee ='"+self.employee+"' ")	

		if self.modify_iqama_issue_date is not None:
			frappe.db.sql("update `tabEmployee` set iqama_issue_date = '"+self.modify_iqama_issue_date+"' where employee ='"+self.employee+"' ")	

		if  self.modify_iqama_expiry_hijri is not None:
			frappe.db.sql("update `tabEmployee` set iqama_expiry_hijri = '"+ self.modify_iqama_expiry_hijri+"' where employee ='"+self.employee+"' ")	

		if self.modify_passport_number is not None:
			frappe.db.sql("update `tabEmployee` set passport_number = '"+self.modify_passport_number+"' where employee ='"+self.employee+"' ")	

		if self.modify_date_of_issue is not None:
			frappe.db.sql("update `tabEmployee` set date_of_issue = '"+self.modify_date_of_issue+"' where employee ='"+self.employee+"' ")

		if self.modify_valid_upto_english is not None:
			frappe.db.sql("update `tabEmployee` set valid_upto = '"+self.modify_valid_upto_english+"' where employee ='"+self.employee+"' ")

		if self.modify_driving_license_no is not None:
			frappe.db.sql("update `tabEmployee` set driving_license_no = '"+self.modify_driving_license_no+"' where employee ='"+self.employee+"' ")	


		if self.modify_driving_license_expiry_date is not None:
			frappe.db.sql("update `tabEmployee` set driving_license_expiry_date = '"+self.modify_driving_license_expiry_date+"' where employee ='"+self.employee+"' ")	

		if self.modify_driving_license_issue_date is not None:
			frappe.db.sql("update `tabEmployee` set driving_license_issue_date = '"+self.modify_driving_license_issue_date+"' where employee ='"+self.employee+"' ")	

		if self.modify_baladiya_card_no is not None:
			frappe.db.sql("update `tabEmployee` set baladiya_card_no = '"+self.modify_baladiya_card_no+"' where employee ='"+self.employee+"' ")	

		if self.modify_exam_date is not None:
			frappe.db.sql("update `tabEmployee` set exam_date = '"+self.modify_valid_upto_english+"' where employee ='"+self.employee+"' ")	

		if self.modify_training_expiry_date is not None:
			frappe.db.sql("update `tabEmployee` set training_expiry_date = '"+self.modify_training_expiry_date+"' where employee ='"+self.employee+"' ")	

		if self.modify_personal_email is not None:
			frappe.db.sql("update `tabEmployee` set personal_email = '"+self.modify_personal_email+"' where employee ='"+self.employee+"' ")	

		if self.modify_company_email is not None:
			frappe.db.sql("update `tabEmployee` set company_email = '"+self.modify_company_email+"' where employee ='"+self.employee+"' ")													
		
		update_family(self)
		frappe.db.commit()
		frappe.msgprint("Employee Details Updated Successfully")	 	 



def update_family(self):
	
	for i in range(0,len(self.family)):

		# Update Family Details Function
		if self.family[i].ref:

			ref=self.family[i].ref	
			if self.family[i].member_name is not None:
				frappe.db.sql("update `tabFamily Details` set member_name = '"+self.family[i].member_name+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].relation is not None:
				frappe.db.sql("update `tabFamily Details` set relation = '"+self.family[i].relation+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].gender is not None:
				frappe.db.sql("update `tabFamily Details` set gender = '"+self.family[i].gender+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].date_of_birth is not None:
				frappe.db.sql("update `tabFamily Details` set date_of_birth = '"+self.family[i].date_of_birth+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].valid_up_to is not None:
				frappe.db.sql("update `tabFamily Details` set valid_up_to = '"+self.family[i].valid_up_to+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].iqama_no is not None:
				frappe.db.sql("update `tabFamily Details` set iqama_no = '"+self.family[i].iqama_no+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].insurance_membership_no is not None:
				frappe.db.sql("update `tabFamily Details` set insurance_membership_no = '"+self.family[i].insurance_membership_no+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].policy_no is not None:
				frappe.db.sql("update `tabFamily Details` set policy_no = '"+self.family[i].policy_no+"' where parent = '"+self.employee+"' and name='"+ref+"' ")
			
			if self.family[i].insurance_issue_date is not None:
				frappe.db.sql("update `tabFamily Details` set insurance_issue_date = '"+self.family[i].insurance_issue_date+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].insurance_class is not None:
				frappe.db.sql("update `tabFamily Details` set insurance_class = '"+self.family[i].insurance_class+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].insurance_approval_limit is not None:
				frappe.db.sql("update `tabFamily Details` set insurance_approval_limit = '"+self.family[i].insurance_approval_limit+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].insurance_expiry_date is not None:
				frappe.db.sql("update `tabFamily Details` set insurance_expiry_date = '"+self.family[i].insurance_expiry_date+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].iqama_issue_date is not None:
				frappe.db.sql("update `tabFamily Details` set iqama_issue_date = '"+self.family[i].iqama_issue_date+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].iqama_expiry_date is not None:
				frappe.db.sql("update `tabFamily Details` set iqama_expiry_date = '"+self.family[i].iqama_expiry_date+"' where parent = '"+self.employee+"' and name='"+ref+"' ")

			if self.family[i].passport_number is not None:
				frappe.db.sql("update `tabFamily Details` set passport_number = '"+self.family[i].passport_number+"' where parent = '"+self.employee+"' and name='"+ref+"' ")	

			frappe.db.commit()
			# frappe.msgprint("Family Details Updated Successfully")	 	 	 
	
		# Insert Family Details Function
		if not self.family[i].ref:
			# frappe.msgprint("family")
			doc = frappe.new_doc("Family Details")
			doc.parent = self.employee
			doc.parentfield="family"
			doc.parenttype="Employee"
			doc.member_name = self.family[i].member_name
			doc.relation=self.family[i].relation
			doc.gender=self.family[i].gender
			doc.date_of_birth=self.family[i].date_of_birth
			doc.iqama_no=self.family[i].iqama_no
			doc.insurance_membership_no=self.family[i].insurance_membership_no
			doc.passport_number=self.family[i].passport_number
			doc.insurance_class=self.family[i].insurance_class
			doc.insurance_issue_date=self.family[i].insurance_issue_date
			doc.insurance_approval_limit=self.family[i].insurance_approval_limit
			doc.insurance_expiry_date=self.family[i].insurance_expiry_date
			doc.iqama_issue_date=self.family[i].iqama_issue_date
			doc.iqama_expiry_date=self.family[i].iqama_expiry_date
			doc.insert(ignore_permissions=True)
			doc.flags.ignore_mandatory = True
			doc.save()
			 
			frappe.msgprint("Family Details Inserted Successfully")
	return "success"
		

@frappe.whitelist()
def store_val(employee):
	res=frappe.db.sql("SELECT name,member_name, gender,date_of_birth,relation ,passport_number,valid_up_to,iqama_no ,insurance_membership_no , policy_no,insurance_class,insurance_issue_date,insurance_expiry_date ,insurance_approval_limit FROM `tabFamily Details` where parent='"+employee+"' ",as_dict=True)
	# frappe.msgprint(str(res))
	return res


