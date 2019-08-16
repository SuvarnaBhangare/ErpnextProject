SELECT * FROM 5a4ef43fefa7006e.`tabSales Invoice Item`;

select commtab.Vehicle,I.item_code , I.item_name,SII.item_code as SI_code,PII.item_code as PI_code ,sum(SII.base_net_amount) as credit ,sum(PII.base_net_amount) as debit ,(sum(PII.base_net_amount)-sum(SII.base_net_amount)) as Balance from  `tabItem` I 
left join `tabSales Invoice Item` SII on SII.item_code = I.item_code 
left join `tabPurchase Invoice Item` PII on PII.item_code = I.item_code
left  join

(select A.asset_name,A.item_code as assetitem,A.name as asset,V.name as Vehicle from `tabAsset` A left join `tabVehicle` V on V.asset_id = A.name ) as commtab on commtab.assetitem = I.item_code
 where commtab.Vehicle is not null

group by commtab.Vehicle,I.item_code




-------------------------------------------------------------------------------------------------------------------------------------
done by suresh N



select  veh_name as 'Truck No',item_code,item_name,sum(purchase_amount),sum(sales_amount),sum(purchase_amount)-sum(sales_amount)  as 'Balance'

from (
	 select veh.veh_name,(case when veh.veh_name is not null then @lft+1 else @lft=0 END) as leftr, PI.item_code, PI.item_name,sum(PI.base_net_amount) as 'purchase_amount',0.00 as 'sales_amount','Purchase Invoice' from `tabPurchase Invoice Item` PI
	left join(
	select It.name  as it_name, V.name as veh_name from `tabItem` It 
	left join `tabAsset` A on A.item_code = It.name 
	left join `tabVehicle` V on V.asset_id = A.name
	) veh on veh.it_name = PI.item_code
	where veh.veh_name is not null
	group by PI.item_code

	union all

	select veh.veh_name,(case when veh.veh_name is not null then @lft+1 else @lft=0 END) as leftr, SI.item_code, SI.item_name,0.00 as 'purchase_amount',sum(SI.base_net_amount) as 'sales_amount','Sales Invoice' from `tabSales Invoice Item` SI
	left join(
	select It.name  as it_name, V.name as veh_name from `tabItem` It 
	left join `tabAsset` A on A.item_code = It.name 
	left join `tabVehicle` V on V.asset_id = A.name
	) veh on veh.it_name = SI.item_code
	where veh.veh_name is not null
	group by SI.item_code
)Veh_Sum
group by veh_name













