# -*- coding: utf-8 -*-
# Copyright (c) 2018, Digitalprizm and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class AirlineTicketRequest(Document):

  def validate(self):
    date_result=self.date_val()
    if date_result:
      frappe.throw("There is a trip already allocated between this period")

  def date_val(self):
    data_val_sql="SELECT * FROM `tabAirline Ticket Request` where (from_date between '{0}' and '{1}' or to_date between '{0}' and '{1}') and employee_id ='{2}' and  docstatus = '1'".format(self.from_date,self.to_date,self.employee_id) 
    data_val_sql_res=frappe.db.sql(data_val_sql,as_dict=True)
    return data_val_sql_res

  def req_head_count(self,from_date,to_date):
    head_count_sql="SELECT count(from_date) year_count,sum(number_of_eligible_tickets) ticket_count FROM `tabAirline Ticket Request` where employee_id='{2}'and reason='Vacation' and from_date between '{0}' and '{1}'".format(from_date,to_date,self.employee_id)
    head_count_result=frappe.db.sql(head_count_sql,as_dict=1)
    return head_count_result

  def family_members(self):
    family_sql="select member_name,gender,date_of_birth from`tabFamily Details` where parent = '{0}'".format(self.employee_id)
    family_sql_res=frappe.db.sql(family_sql,as_dict=1)
    return family_sql_res
    
  def head_count(self):
    emp_sql="SELECT number_of_trips,eligible_head_count_including_self,year,date_of_joining,origin_airport,destination_airport,class,gender,date_of_birth FROM `tabEmployee` where name='{0}'".format(self.employee_id)
    emp_result=frappe.db.sql(emp_sql,as_dict=1)
    return emp_result




