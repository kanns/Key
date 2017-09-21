using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper.Contrib.Extensions;

/// <summary>
/// Summary description for Registration
/// </summary>

    [Table("Registration")]
public class Registration
{
    [Key]
    public Int64 RegId { get; set; }

    public String FirstName { get; set; }


    public String LastName { get; set; }

    public String Address { get; set; }


    public String City { get; set; }

    public String State { get; set; }

    public String Zipcode { get; set; }

    public String Email { get; set; }

    public String MobileNumber { get; set; }

    public String WarrantySlno { get; set; }


    public DateTime? PurchaseDate { get; set; }

    public String PurchaseReceiptFile { get; set; }

    public String CreatedDate { get; set; }
  //  public string WarrantyItem { get; set; }
}