<%@ WebHandler Language="C#" Class="RegistrationService" %>

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Versioning;
using System.ServiceModel.Description;
using System.Web;
using System.Xml;

public class RegistrationService : IHttpHandler
{


    public void ProcessRequest(HttpContext context)
    {
        string action = context.Request.Form["action"];
        switch (action)
        {
            case "save":
                string message = String.Empty;
                string serial_no = context.Request.Form["serial"];
                bool isSerialNumberExist = SerialNumberExist(serial_no, out message);
                if (isSerialNumberExist && message == String.Empty)
                {
                    string filename = String.Empty;

                    HttpFileCollection files = context.Request.Files;
                    if (files.Count > 0)
                    {
                        HttpPostedFile file = files[0];
                        string fname;
                        if (HttpContext.Current.Request.Browser.Browser.ToUpper() == "IE" ||
                            HttpContext.Current.Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                        {
                            string[] testfiles = file.FileName.Split(new char[] { '\\' });
                            fname = testfiles[testfiles.Length - 1];
                        }
                        else
                        {
                            fname = file.FileName;
                        }
                        filename = String.Format("{0}_{1}", serial_no, fname);
                        fname = Path.Combine(context.Server.MapPath("~/uploads/"), filename);

                        file.SaveAs(fname);
                    }

                    SaveToDB(context, filename);
                    message = "success";
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(message);
                }
                else
                {
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(message);
                }
                break;
            case "login":

                string isAdmin = CheckLogin(context);
                context.Response.Write(isAdmin);

                break;
            case "getRecords":
                //get records
                context.Response.ContentType = "text/plain";
                string startDate = context.Request.Form["startdate"];
                string endDate = context.Request.Form["enddate"];
                var data = GetRecords(startDate, endDate);
                string result = Newtonsoft.Json.JsonConvert.SerializeObject(data);
                context.Response.Write(result);
                break;
            case "GetSerials":
                context.Response.ContentType = "text/plain";
                string FilterBy = context.Request.Form["filterby"];
                var serials = GetSerials(FilterBy);
                string serialresults = Newtonsoft.Json.JsonConvert.SerializeObject(serials);
                context.Response.Write(serialresults);
                break;
            case "GenerateSerials":
                context.Response.ContentType = "text/plain";
                string SerialsToGenerate = context.Request.Form["serials"];
                string Filter_By = context.Request.Form["filterby"];
                var generatedserials = GenerateSerials(SerialsToGenerate,Filter_By);
                string generatedresults = Newtonsoft.Json.JsonConvert.SerializeObject(generatedserials);
                context.Response.Write(generatedresults);
                break;
            default:
                break;
        }

    }

    private object GenerateSerials(string serialsToGenerate,string filterBy)
    {
        int SerialCount = 0;
        if (int.TryParse(serialsToGenerate, out SerialCount))
        {
            using (DBContext dbContext = new DBContext())
            {
                return dbContext.GenerateSerials(SerialCount, filterBy);
            }
        }
        else
        {
            throw new Exception("Invalid Serial.");
        }
    }

    private object GetSerials(string filterBy)
    {
        using (DBContext dbContext = new DBContext())
        {
            return dbContext.GetSerialRecords(filterBy);
        }
    }

    private bool SerialNumberExist(string serialNo, out string message)
    {
        message = String.Empty;
        using (DBContext dbContext = new DBContext())
        {
            return dbContext.IsSerialNumberExist(serialNo, out message);
        }
    }

    private string CheckLogin(HttpContext context)
    {
        string username = context.Request.Form["username"];
        string password = context.Request.Form["password"];
        XmlDocument doc = new XmlDocument();
        doc.Load(context.Server.MapPath("users.xml"));
        XmlNodeList users = doc.SelectNodes("users/user");
        for (int i = 0; i < users.Count; i++)
        {
            if (users[i].Attributes["name"].Value == username
                && users[i].Attributes["password"].Value == password)
            {
                if (users[i].Attributes["role"].Value == "admin")
                    return "True";
                else
                    return "You should be Admin to view the records";
            }
        }
        return "Invalid username/password";


    }


    private IEnumerable<Registration> GetRecords(string startdate, string enddate)
    {
        using (DBContext dbContext = new DBContext())
        {
            return dbContext.GetRecords(startdate, enddate);
        }
    }

    private void SaveToDB(HttpContext context, string filename)
    {
        //string[] fieldnames = new[]
        //{
        //    "firstname", "middlename", "lastname", "address", "appartment", "city", "state", "zipcode", "email",
        //    "confirmemail", "phonenumber", "warrantyslno", "Warrantyitem", "maxCoveramt", "purchasedate", "hasService",
        //    "CarrierType", "carriermode", "imeinumber", "devicetype", "devicemodel", "devicecolor", "devicestorage"
        //};


        Registration reg = new Registration();
        reg.FirstName = context.Request.Form["first_name"];
        reg.LastName = context.Request.Form["last_name"];
        reg.Address = context.Request.Form["address"];
        reg.City = context.Request.Form["city"];
        reg.State = context.Request.Form["state"];
        reg.Zipcode = context.Request.Form["zip"];
        reg.Email = context.Request.Form["email"];
        reg.MobileNumber = context.Request.Form["phone"];
        reg.WarrantySlno = context.Request.Form["serial"];
        // reg.WarrantyItem = context.Request.Form["screen_serial"];
        reg.PurchaseReceiptFile = filename;
        reg.CreatedDate = DateTime.Now.ToString("MM/dd/yyyy");


        using (DBContext dbContext = new DBContext())
        {
            dbContext.SaveRegistration(reg);
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}