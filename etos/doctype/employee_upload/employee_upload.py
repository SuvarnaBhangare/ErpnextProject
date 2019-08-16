# -*- coding: utf-8 -*-
# Copyright (c) 2018, AVU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import cstr, add_days, date_diff
from frappe import _
from frappe.utils.csvutils import UnicodeWriter
from frappe.model.document import Document
from frappe.utils.csvutils import read_csv_content_from_uploaded_file
import datetime

class EmployeeUpload(Document):
	def on_submit(self):
		for row in self.employee_detail:
			self.create_employee(row)
		frappe.msgprint("Employee Created Successfully")	

	def validate(self):
		error_list=''
		temp_1,temp_2,temp_3,temp_4 = [],[],[],[]

		for row in self.employee_detail:
			validate_result = date_validate(row.date_of_birth,row.date_of_joining,row.idx-1,'in Table')
			if validate_result:
				error_list += validate_result

			birth_result=birth_validate(row.date_of_birth,row.idx-1,'in Table')
			if birth_result:
				error_list += birth_result

			driving_license_no=row.driving_license_no
			if driving_license_no:
				driving_license_result=unique_value('Employee',{'driving_license_no': str(driving_license_no)},"In Table")
				if driving_license_result=='pass' or driving_license_no in temp_1:
					driving_license_no=None
					error_list +='<span class="indicator red list-group-item">Please Enter Unique Driving license No at row {0} in Table</span>'.format(str(row.idx))
				if driving_license_no:
					temp_1.append(driving_license_no)

			iqama_no=row.iqama_no
			if iqama_no:
				iqama_no_result=unique_value('Employee',{'iqama_no': str(iqama_no)},"In Table")
				if iqama_no_result=='pass' or iqama_no in temp_2:
					iqama_no=None
					error_list +='<span class="indicator red list-group-item">Please Enter Unique Iqama No at row {0} in Table</span>'.format(str(row.idx))
				if iqama_no:
					temp_2.append(iqama_no)

			baladiya_card_no=row.baladiya_card_no
			if baladiya_card_no:
				baladiya_card_no_result=unique_value('Employee',{'baladiya_card_no': str(baladiya_card_no)},"In Table")
				if baladiya_card_no_result=='pass' or baladiya_card_no in temp_3:
					baladiya_card_no=None
					error_list +='<span class="indicator red list-group-item">Please Enter Unique Baladiya Card No at row {0} in Table</span>'.format(str(row.idx))
				if baladiya_card_no:
					temp_3.append(baladiya_card_no)

			enrollment_no=row.enrollment_no
			if enrollment_no:
				enrollment_no_result=unique_value('Employee',{'enroll_number': str(enrollment_no)},"in Table")
				if enrollment_no_result=='pass' or enrollment_no in temp_4:
					enrollment_no=None
					error_list +='<span class="indicator red list-group-item">Please Enter Unique Enrollment No at row {0} in Table</span>'.format(str(row.idx))
				if enrollment_no:
					temp_4.append(enrollment_no)			

						

		if error_list:
			frappe.throw(_(list_str_format(error_list)))
		
	def create_employee(self,row):
		self_emp=frappe.new_doc("Employee")
		self_emp.name = "EMP/"+row.enrollment_no
		# frappe.throw(str(self_emp.name))
		self_emp.first_name = row.employee_name
		self_emp.middle_name= row.middle_name
		self_emp.last_name = row.last_name
		self_emp.gender = row.gender
		self_emp.full_name_arabic = row.full_name_in_arabic
		self_emp.saudi_or_nonsaudi = row.saudi_or_nonsaudi
		self_emp.shift_type = row.shift_type
		self_emp.eligible_week_off_days = row.eligible_week_off_days
		self_emp.weekly_off_day1 = row.week_off_day1
		self_emp.nationality = row.nationality
		self_emp.country = row.country
		self_emp.passport_number = row.passport_no
		self_emp.valid_upto_hijri = row.valid_upto_hijri
		self_emp.date_of_birth = row.date_of_birth
		self_emp.date_of_joining = row.date_of_joining
		self_emp.department = row.department
		self_emp.enroll_number = row.enrollment_no
		self_emp.employee_category = row.employee_category
		# self_emp.driving_license_no = row.driving_license_no
		self_emp.employment_type = row.employment_type
		# self_emp.driving_license_expiry_date = row.driving_license_expiry
		# self_emp.baladiya_card_no = row.baladiya_card_no
		self_emp.iqama_issue_date = row.iqama_expiry
		self_emp.iqama_no = row.iqama_no
		self_emp.employee_salary_type =row.salary_type
		self_emp.division=row.division
		self_emp.previous_employee_id=row.previous_employee_id
		self_emp.contractor=row.contractor
		self_emp.salutation=row.salutation
		self_emp.holiday_list=row.holiday_list
		self_emp.company=row.company

		self_emp.save()



# def make_employee(self):
# 	for i in range(0,len(self.employee_detail)):


def birth_validate(birth_date,idx,source):
	if frappe.utils.data.getdate(str(birth_date)) >= frappe.utils.data.getdate(frappe.utils.data.nowdate()):
		return '<span class="indicator red list-group-item">Date of Birth cannot be greater than today at row '+str(idx+1)+' '+str(source)+' For Date Of Birth</span>'
	else:
		return ''


def date_validate(birth_date,joining_date,idx,source):
	if birth_date >= joining_date:
		 return '<span class="indicator red list-group-item">Date of Birth cannot be greater then or equal Joining Date at row '+str(idx+1)+' '+str(source)+'</span>'
	else:
		return ''

def val_date_format(idx,date_str=None,source=None):
	if date_str:
		try:
			datetime.datetime.strptime(date_str, "%Y-%m-%d")
		except ValueError:
			return '<span class="indicator red list-group-item">Incorrect Date Format at row '+str(idx+1)+' '+str(source)+'</span>'
		
		return ''
	else:
		return ''

def val_link(idx,doc_name,name,source):
	if name and doc_name:
		result = frappe.db.get_values(""+str(doc_name)+"", {'name': str(name)}, "*", as_dict=True)
		if not result:
			return '<span class="indicator red list-group-item">Please Enter Valid {0} at row {1} {2}</span>'.format(doc_name,str(idx+1),source)
		else:
			return ''
	else:
		return ''

def val_dep_com(idx,doc_name,name,company):
	if name and doc_name and company:
		result = frappe.db.get_values(""+str(doc_name)+"", {'name':str(name),'company': str(company)}, "*", as_dict=True)
		if not result:
			return '<span class="indicator red list-group-item">Please Enter Valid {0} for Company {2} at row {1} in Excel</span>'.format(doc_name,str(idx+1),company)
		else:
			return ''
	else:
		return ''


def unique_value(doc_name,fieldname,source):
	if doc_name and fieldname:
		result = frappe.db.get_values(""+str(doc_name)+"", fieldname , "*", as_dict=True)
		if result:
			return 'pass'
		else:
			return ''
	else:
		return ''


columns=["Salutation","First Name","Middle Name","Last Name","Full Name in Arabic","Saudi or Non-Saudi","Gender","Date of Birth","Date of Joining","Department","Shift Type","Eligible Week Off Days","Week Off Day1","Nationality","Country","Passport Number","Valid upto Hijri(For Passport)","Grade","Enrollment No" , "Employment Type","Employee Category" ,"Contractor","Employee Salary Type","Division","Previous Employee Id","Holiday List","Iqama No" ,"Iqama Expiry Date","Company"]

@frappe.whitelist()
def upload():
	file_name=frappe.form_dict.filename
	file_type=file_name.split('.')[-1]
	if not file_type == 'csv':
		frappe.msgprint(_("Document with extension CSV can only be uploaded"))
		return
	rows = read_csv_content_from_uploaded_file()
	error_list=''
	new_list=[]
	temp_1=temp_2=temp_3=temp_4=[]

	for i in range(4, len(rows)):
		if i==4:
			if not len(rows[i]) == len(columns):
				frappe.msgprint(_("Please Upload Standard Template"))
				return
			
			if rows[i][0] != columns[0] or rows[i][1] != columns[1] or rows[i][2] != columns[2] or rows[i][3] != columns[3] or rows[i][4] != columns[4] or rows[i][5] != columns[5] or rows[i][6] != columns[6] or rows[i][7] != columns[7] or rows[i][8] != columns[8] or rows[i][9] != columns[9] or rows[i][10] != columns[10] or rows[i][11] != columns[11] or rows[i][12] != columns[12]or rows[i][13] != columns[13]or rows[i][14] != columns[14]or rows[i][15] != columns[15]or rows[i][16] != columns[16]or rows[i][17] != columns[17] or rows[i][18] != columns[18] or rows[i][19] != columns[19] or rows[i][20] != columns[20] or rows[i][21] != columns[21] or rows[i][22] != columns[22] or rows[i][23] != columns[23] or rows[i][24] != columns[24] or rows[i][25] != columns[25] or rows[i][26] != columns[26] or rows[i][27] != columns[27] or rows[i][28] != columns[28]:
				frappe.msgprint("Please Do not Change Column Name in Template")
				return

		else:
			if rows[i][1]:
				validate_result=join_date_result=birth_date_result=iqama_expiry_date_result=department_result=gender_result=division_result=contractor_result=holi_list_result=salutation_result=company_result=''

				birth_date = rows[i][7]
				birth_date_result = val_date_format(i,birth_date,'in Excel For Date of Birth')
				if birth_date_result :
					birth_date = None
					error_list += birth_date_result
				
				if birth_date:
					birth_result=birth_validate(birth_date,i,'in Excel')
					if birth_result:
						error_list += birth_result


				joining_date = rows[i][8]
				join_date_result = val_date_format(i,joining_date,'in Excel For Joining Date')
				if join_date_result :
					joining_date = None
					error_list += join_date_result

				if birth_date and joining_date:
					birth_date = frappe.utils.data.getdate(birth_date)
					joining_date = frappe.utils.data.getdate(joining_date)
					validate_result = date_validate(birth_date,joining_date,i,"in Excel")
					if validate_result:
						error_list += validate_result

				iqama_expiry_date = rows[i][27]
				if iqama_expiry_date is not None:
					iqama_expiry_date_result = val_date_format(i,iqama_expiry_date,"in Excel For Iqama Expiry Date")
					if iqama_expiry_date_result :
						iqama_expiry_date = None
						error_list += iqama_expiry_date_result

				# driving_license_expiry_date = rows[i][13]
				# driving_license_date_result = val_date_format(i,driving_license_expiry_date)
				# if driving_license_date_result :
				# 	driving_license_expiry_date = None
				# 	error_list += driving_license_date_result
				
				department = rows[i][9]
				if department is not None:
					department_result= val_link(i,'Department',str(department),"in Excel")
					if department_result :
						department = ''
						error_list += department_result
					
					if rows[i][28] and department:
						com_validate = val_dep_com(i,'Department',str(department),rows[i][28])
						if com_validate:
							department = ''
							error_list += com_validate

				division = rows[i][23]
				if division is not None:
					division_result= val_link(i,'Division',str(division),"in Excel")
					if division_result :
						division = ''
						error_list += division_result	

				contractor = rows[i][21]
				if contractor is not None:
					contractor_result= val_link(i,'Contractor',str(contractor),"in Excel")
					if contractor_result :
						contractor = ''
						error_list += contractor_result		
				
				# salary_type = rows[i][15]
				# salary_type_result= val_link(i,'Employee',str(salary_type))
				# if salary_type_result :
				# 	salary_type = ''					
				# 	error_list += salary_type_result
					
				gender = rows[i][6]
				if gender is not None:
					gender_result= val_link(i,'Gender',str(gender),"in Excel")
					if gender_result :
						gender = ''					
						error_list += gender_result

				shift_type = rows[i][10]
				if shift_type is not None:
					shift_result = val_link(i,'Shift Type',str(shift_type),"in Excel")
					if shift_result :
						shift_type = ''					
						error_list += shift_result

				employee_category = rows[i][20]
				if employee_category is not None:
					employee_category_result= val_link(i,'Employee Category Rule',str(employee_category),"in Excel")
					if employee_category_result :
						employee_category = ''					
						error_list += employee_category_result
					
				employee_type = rows[i][19]
				if employee_type is not None:
					employee_type_result= val_link(i,'Employment Type',str(employee_type),"in Excel")
					if employee_type_result :
						employee_type = ''					
						error_list += employee_type_result

				holi_list = rows[i][25]
				if holi_list is not None:
					holi_list_result= val_link(i,'Holiday List',str(holi_list),"in Excel")
					if holi_list_result :
						holi_list = ''
						error_list += holi_list_result	
				
				eligible_weekoff = rows[i][11]
				if eligible_weekoff is not None:
					options = frappe.get_meta("Employee Detail").get_field("eligible_week_off_days").options
					if eligible_weekoff not in options:
						eligible_weekoff = ""

				employee_sal_type = rows[i][22]
				if employee_sal_type is not None:
					options = frappe.get_meta("Employee Detail").get_field("salary_type").options
					if employee_sal_type not in options:
						employee_sal_type = ""

				week_off_day = rows[i][12]
				week_off = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
				if week_off_day in week_off:
					pass
				else:
					week_off_day = ""
				
				nationality = rows[i][13]
				if nationality is not None:
					nationality_result = val_link(i,'Nationality',str(nationality),"in Excel")
					if nationality_result:
						nationality = ""
						error_list += nationality_result

				country = rows[i][14]
				if country is not None:
					country_result = val_link(i,'Country',str(country),"in Excel")
					if country_result:
						country = ""
						error_list += country_result

				grade = rows[i][17]
				if grade is not None:
					grade_result = val_link(i,'Employee Grade',str(grade),"in Excel")
					if grade_result:
						grade = ""
						error_list += grade_result

				salutation = rows[i][0]
				if salutation is not None:
					salutation_result= val_link(i,'Salutation',str(salutation),"in Excel")
					if salutation_result :
						salutation = ''
						error_list += salutation_result		

				# Saudi or Non-Saudi
				s_or_ns = rows[i][5]
				if s_or_ns is not None:
					if s_or_ns == "Saudi" or s_or_ns == "saudi":
						s_or_ns = 1
					else:
						s_or_ns = 0

				# driving_license_no=rows[i][12]
				# if driving_license_no:
				# 	driving_license_result=unique_value('Employee',{'driving_license_no': str(driving_license_no)})
				# 	if driving_license_result=='pass' or driving_license_no in temp_1:
				# 		driving_license_no=None
				# 		error_list +='<span class="indicator red list-group-item">Please Enter Unique Driving license No at row {0}</span>'.format(str(i+1))
				# 	if driving_license_no:
				# 		temp_1.append(driving_license_no)

				iqama_no=rows[i][26]
				if iqama_no:
					iqama_no_result=unique_value('Employee',{'iqama_no': str(iqama_no)},"In Excel")
					if iqama_no_result=='pass' or iqama_no in temp_2:
						iqama_no=None
						error_list +='<span class="indicator red list-group-item">Please Enter Unique Iqama No at row {0}</span>'.format(str(i+1))
					if iqama_no:
						temp_2.append(iqama_no)

				# baladiya_card_no=rows[i][14]
				# if baladiya_card_no:
				# 	baladiya_card_no_result=unique_value('Employee',{'baladiya_card_no': str(baladiya_card_no)})
				# 	if baladiya_card_no_result=='pass' or baladiya_card_no in temp_3:
				# 		baladiya_card_no=None
				# 		error_list +='<span class="indicator red list-group-item">Please Enter Unique Baladiya Card No at row {0}</span>'.format(str(i+1))
				# 	if baladiya_card_no:
				# 		temp_3.append(baladiya_card_no)

				enrollment_no=rows[i][18]
				if enrollment_no:
					enrollment_no_result=unique_value('Employee',{'enroll_number': str(enrollment_no)},"In Excel")
					if enrollment_no_result=='pass' or enrollment_no in temp_4:
						enrollment_no=None
						error_list +='<span class="indicator red list-group-item">Please Enter Unique Enrollment No at row {0}</span>'.format(str(i+1))
					if enrollment_no:
						temp_4.append(enrollment_no)
	
				company = rows[i][28]
				if company is not None :
					company_result= val_link(i,'Company',str(company),"in Excel")
					if company_result :
						company = ''
						error_list += company_result

				if not department or not company:
					department = ''
					company = ''
				
				new_list.append({"salutation":rows[i][0],"employee_name" :rows[i][1],"full_name_in_arabic":rows[i][4],"saudi_or_nonsaudi":s_or_ns,"shift_type":shift_type,"eligible_week_off_days":eligible_weekoff,"week_off_day1":week_off_day,"nationality":nationality,"country":country,"grade":grade,"passport_no":rows[i][15],"valid_upto_hijri":rows[i][16],"middle_name" :rows[i][2],"last_name" :rows[i][3],"gender" :gender,"date_of_birth" :birth_date,"date_of_joining" :joining_date,"department" :department, "enrollment_no" :enrollment_no, "employment_type":employee_type, "employee_category" :employee_category,"iqama_no" :iqama_no,"iqama_expiry":iqama_expiry_date, "salary_type":employee_sal_type,"division":rows[i][23],"contractor":rows[i][21],"holiday_list":rows[i][25],"previous_employee_id":rows[i][24],'company':company})


	if error_list:
		frappe.msgprint(_(list_str_format(error_list)))	
	return new_list		


def list_str_format(violation):
	if violation:
		return "<div class=\"list-group\">"+violation+"</div>"
	else:
		return

@frappe.whitelist()
def get_template():

	args = frappe.local.form_dict
	w = UnicodeWriter()
	w = add_header(w, args)

	# write out response as a type csv
	frappe.response['result'] = cstr(w.getvalue())
	frappe.response['type'] = 'csv'
	frappe.response['doctype'] = "Employee Upload"

def add_header(w, args):
	
	w.writerow(["Notes:"])
	w.writerow(["Please do not change the template headings"])
	w.writerow(["Date Should Be In YYYY-MM-DD Format And First Name Field Is Mandatory"])
	w.writerow(["Salary Type Should Be One Of This Value: Monthly Salary, Hourly Salary, PO rate Salary","","","","","(Saudi/Non-Saudi)","","YYYY-MM-DD","YYYY-MM-DD","", "" , "", "" ,"" ,"" ,"" ,"YYYY-MM-DD","","","", "" , "", "" ,"" ,"" ,"" ,"","YYYY-MM-DD",""])
	w.writerow(columns)
	return w


