using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ez.Word.Importer;

internal class WordEntity(int id, string word, string type, string category)
{
    public int Id { get; set; } = id;
    public string Word { get; set; } = word;

    /// <summary>
    /// Orðflokkur
    /// Í þriðja sviði í Sigrúnarsniði er orðflokkkur eða kyn nafnorðs sem eru skammstöfuð á eftirfarandi hátt:
    /// afn afturbeygt fornafn, 
    /// ao atviksorð, 
    /// fn fornafn(þ.e.öll fornöfn önnur afturbeygt fornafn eða persónufornöfn), 
    /// fs forsetning, 
    /// gr greinir, 
    /// hk hvorugkynsnafnorð, 
    /// kk karlkynsnafnorð, 
    /// kvk kvenkynsnafnorð, 
    /// lo lýsingarorð, 
    /// nhm nafnháttarmerki, 
    /// pfn persónufornfn, 
    /// rt raðtala, 
    /// so sagnorð, 
    /// st samtenging, 
    /// to töluorð, 
    /// uh upphrópun.
    /// </summary>
    public string Category { get; set; } = category;

    /// <summary>
    /// Auðkenni
    /// 
    /// Í öðru sviði í Sigrúnarsniði er auðkenni, þ.e.einkvæm tala fyrir uppflettiorð(BIN-id).
    /// </summary>
    public string Type { get; set; } = type;


    /// <summary>
    /// Beygingarmynd
    /// 
    /// Í fimmta sviði Sigrúnarsniðs er beygingarmynd.     
    /// </summary>
    public IDictionary<string, string> InflectionForms { get; set; } = new Dictionary<string, string>();

}
