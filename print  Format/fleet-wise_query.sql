select veh_name as 'Truck No',item_code,item_name,sum(purchase_amount),sum(sales_amount),sum(purchase_amount)-sum(sales_amount)  as 'Balance'
from (
	select veh.veh_name, PI.item_code, PI.item_name,sum(PI.base_net_amount) as 'purchase_amount',0.00 as 'sales_amount','Purchase Invoice' from `tabPurchase Invoice Item` PI
	left join(
	select It.name  as it_name, V.name as veh_name from `tabItem` It 
	left join `tabAsset` A on A.item_code = It.name 
	left join `tabVehicle` V on V.asset_id = A.name
	) veh on veh.it_name = PI.item_code
	where veh.veh_name is not null and PI.docstatus=1
	group by PI.item_code

	union all

	select veh.veh_name, SI.item_code, SI.item_name,0.00 as 'purchase_amount',sum(SI.base_net_amount) as 'sales_amount','Sales Invoice' from `tabSales Invoice Item` SI
	left join(
	select It.name  as it_name, V.name as veh_name from `tabItem` It 
	left join `tabAsset` A on A.item_code = It.name 
	left join `tabVehicle` V on V.asset_id = A.name
	) veh on veh.it_name = SI.item_code
	where veh.veh_name is not null
	group by SI.item_code
)Veh_Sum
group by veh_name




