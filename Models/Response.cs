public class Response<T>
{
    public bool Success { get; set; }
    public T Body { get; set; }
    public string Message { get; set; }

    public Response(bool Success, T Body, string Message)
    {
        this.Success = Success;
        this.Body = Body;
        this.Message = Message;
    }

    public static Response<T> Successful(T Body)
    {
        return new Response<T>(true, Body, "");
    }

    public static Response<T> Fail(string Message)
    {
        return new Response<T>(false, default, Message);
    }
}
