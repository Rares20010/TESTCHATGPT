#include <bits/stdc++.h>
using namespace std;

ifstream fin("secvmax.in");
ofstream fout("secvmax.out");

int main()
{
    int n;
    int x[10001];
    int st;
    int dr;
    int lmax;
    int smax;

    fin>>n;

    for(int i=1;i<=n;i++)
        fin>>x[i];

    lmax=0; // lungimea maxima
    smax=0; // suma maxima
    st=0; // stanga
    dr=0; // dreapta

    for(int i=1;i<=n;)
    {
        if(x[i]%2==0)
        {
            int j=i;
            int s=0; // suma curenta

            while(j<=n&&x[j]%2==0)
            {
                s=s+x[j];
                j=j+1;
            }

            int l=j-i; // lungimea curenta

            if(l>lmax||(l==lmax&&s>smax))
            {
                lmax=l;
                smax=s;
                st=i;
                dr=j-1;
            }

            i=j;
        }
        else
            i=i+1;
    }

    fout<<st<<" "<<dr;

    return 0;
}
