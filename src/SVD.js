/******************************************************************\
For an m-by-n matrix A with m >= n, the Thin Singular Value Decomposition
(See: http://en.wikipedia.org/wiki/Singular_value_decomposition#Thin_SVD )
returns:
- an m-by-n matrix U with orthogonal columns, 
- an n-by-n diagonal matrix S, 
- and an n-by-n orthogonal matrix V 
such that A = U*S*V'. (here V' indicates the transposed of V)

The function thinsvd(A), for m >=n, returns an array containing:
- an m x n bidimensional array U with orthogonal columns
- an m-sized unidimensional array containing the n singular values, sorted in descending order
- an n x n bidimensional orthogonal array containing V (NOTE: _not_ V' as NumPy's linalg.svd(A,full_matrices=0) does!!)
If m < n, it returns an array containing:
- an m x m bidimensional array containing U 
- an m-sized unidimensional array containing the n singular values, sorted in descending order
- an m x n bidimensional array V with orthogonal columns

The Singular Values s[] allow to compute the following values of the input argument: 
- Two norm l2n = s[0]
- Condition number cn = l2n / s[Math.min(m,n)-1]
- Rank r = number of singular values larger than cn * eps, 
      (eps being 2.22E-16 i.e. Math.pow(2.0,-52.0)
      
With square random matrices, complexity grows as O(n^3)
Decomposing a 100x100 matrix typically takes, with a 
single-core 1.7GHz Pentium M:
- Chrome 3.0.195.27: 880 ms
- Firefox 3.5.4: 950 ms 
- Safari 4.0.3: 1,360 ms
- MSIE 8.0: 9,554 ms (and three "slow script" warnings)
\******************************************************************/

var hypot = function(a, b) {
    var at = Math.abs(a);
    var bt = Math.abs(b);
    var q;
    if( at > bt ) {
        q = bt / at;
        return at * Math.sqrt( 1.0 + q*q );
    } else {
        if ( bt > 0.0 ){
            q = at / bt;
            return bt * Math.sqrt( 1.0 + q*q );
        } else {
            return 0.0;
        }
    }
};

exports.GLM.thinsvd = function (A) {

    // Derived from JAMA public domain code: http://math.nist.gov/javanumerics/jama/
    var i, j, k, t, f, g, cs, sn; 
    var lowrise = (A.length < A[0].length);  // if true, then rows < columns. in that case, transpose A and exchange U and V on return

    // make a copy, so the original matrix will be preserved 
    var AT = [];
    if(lowrise) {
        for(i=0; i<A[0].length; i++) {
            AT[i] = [];
            for(j=0; j<A.length; j++) {
                    AT[i][j] = A[j][i]; // swap rows with columns
            }
        }
    } else {
        for(i=0; i<A.length; i++) {
            AT[i] = [];
            for(j=0; j<A[0].length; j++) {
                    AT[i][j] = A[i][j]; // swap rows with columns
            }
        }
    }
    A = AT;
    
    var m = A.length;
    var n = A[0].length;

    var nu = Math.min(m,n);
    var s = [];
    var U = [];
    for(i=0; i<m; i++) {
        U[i] = [];
        for(j=0; j<n; j++) {
            U[i][j] = 0.;
        }
    }

    var V = [];
    for(i=0; i<n; i++) {
        V[i] = [];
    }

    var e = [];
    var work = [];
    var wantu = true;
    var wantv = true;

    // Reduce A to bidiagonal form, storing the diagonal elements
    // in s and the super-diagonal elements in e.

    var nct = Math.min(m-1,n);
    var nrt = Math.max(0,Math.min(n-2,m));
    for (k = 0; k < Math.max(nct,nrt); k++) {
    if (k < nct) {
        // Compute the transformation for the k-th column and
        // place the k-th diagonal in s[k].
        // Compute 2-norm of k-th column without under/overflow.
        s[k] = 0;
        for (i = k; i < m; i++) {
            s[k] = hypot(s[k],A[i][k]);
        }
        if (s[k] !== 0.0) {
        if (A[k][k] < 0.0) {
            s[k] = -s[k];
        }
        for (i = k; i < m; i++) {
            A[i][k] /= s[k];
        }
            A[k][k] += 1.0;
        }
            s[k] = -s[k];
        }

        for (j = k+1; j < n; j++) {
            if ((k < nct) && (s[k] !== 0.0))  {

                // Apply the transformation.

                t = 0;
                for (i = k; i < m; i++) {
                    t += A[i][k]*A[i][j];
                }
                t = -t/A[k][k];
                for (i = k; i < m; i++) {
                    A[i][j] += t*A[i][k];
                }
            }

            // Place the k-th row of A into e for the
            // subsequent calculation of the row transformation.

            e[j] = A[k][j];
        }

        if (wantu && (k < nct)) {
            // Place the transformation in U for subsequent back
            // multiplication.
            for (i = k; i < m; i++) {
                U[i][k] = A[i][k];
            }
        }

        if (k < nrt) {
            // Compute the k-th row transformation and place the
            // k-th super-diagonal in e[k].
            // Compute 2-norm without under/overflow.
            e[k] = 0;
            for (i = k+1; i < n; i++) {
                e[k] = hypot(e[k],e[i]);
            }

            if (e[k] !== 0.0) {
                if (e[k+1] < 0.0) {
                    e[k] = -e[k];
                }
                for (i = k+1; i < n; i++) {
                    e[i] /= e[k];
                }
                e[k+1] += 1.0;
            }

            e[k] = -e[k];

            if ((k+1 < m) && (e[k] !== 0.0)) {
                // Apply the transformation.

                for (i = k+1; i < m; i++) {
                    work[i] = 0.0;
                }
                for (j = k+1; j < n; j++) {
                    for (i = k+1; i < m; i++) {
                        work[i] += e[j]*A[i][j];
                    }
                }
                for (j = k+1; j < n; j++) {
                    t = -e[j]/e[k+1];
                    for (i = k+1; i < m; i++) {
                        A[i][j] += t*work[i];
                    }
                }
            }

            if (wantv) {
                // Place the transformation in V for subsequent
                // back multiplication.
                for (i = k+1; i < n; i++) {
                    V[i][k] = e[i];
                }
            }
        }
    }

    // Set up the final bidiagonal matrix or order p.
    var p = Math.min(n,m+1);
    if (nct < n) {
        s[nct] = A[nct][nct];
    }
    if (m < p) {
        s[p-1] = 0.0;
    }
    if (nrt+1 < p) {
        e[nrt] = A[nrt][p-1];
    }
    e[p-1] = 0.0;

    // If required, generate U.

    if (wantu) {
        for (j = nct; j < nu; j++) {
            for (i = 0; i < m; i++) {
                U[i][j] = 0.0;
            }
            U[j][j] = 1.0;
        }
        for (k = nct-1; k >= 0; k--) {
            if (s[k] !== 0.0) {
                for (j = k+1; j < nu; j++) {
                    t = 0;
                    for (i = k; i < m; i++) {
                        t += U[i][k]*U[i][j];
                    }
                    t = -t/U[k][k];
                    for (i = k; i < m; i++) {
                        U[i][j] += t*U[i][k];
                    }
                }
                for (i = k; i < m; i++ ) {
                    U[i][k] = -U[i][k];
                }
                U[k][k] = 1.0 + U[k][k];
                for (i = 0; i < k-1; i++) {
                    U[i][k] = 0.0;
                }
            } else {
                for (i = 0; i < m; i++) {
                    U[i][k] = 0.0;
                }
                U[k][k] = 1.0;
            }
        }
    }

    // If required, generate V.

    if (wantv) {
        for (k = n-1; k >= 0; k--) {
            if ((k < nrt) && (e[k] !== 0.0)) {
                for (j = k+1; j < nu; j++) {
                    t = 0;
                    for (i = k+1; i < n; i++) {
                        t += V[i][k]*V[i][j];
                    }
                    t = -t/V[k+1][k];
                    for (i = k+1; i < n; i++) {
                        V[i][j] += t*V[i][k];
                    }
                }
            }
            for (i = 0; i < n; i++) {
                V[i][k] = 0.0;
            }
            V[k][k] = 1.0;
        }
    }

    // Main iteration loop for the singular values.

    var pp = p-1;
    var iter = 0;
    var totiter = 0;
    var eps =  2.2205E-16; // Math.pow(2.0,-52.0);
    var tiny = 1.6034E-291; // Math.pow(2.0,-966.0);
    while (p > 0) {
        var kase;

        // Here is where a test for too many iterations would go.

        // This section of the program inspects for
        // negligible elements in the s and e arrays.  On
        // completion the variables kase and k are set as follows.

        // kase = 1     if s(p) and e[k-1] are negligible and k<p
        // kase = 2     if s(k) is negligible and k<p
        // kase = 3     if e[k-1] is negligible, k<p, and
        //              s(k), ..., s(p) are not negligible (qr step).
        // kase = 4     if e(p-1) is negligible (convergence).

        for (k = p-2; k >= -1; k--) {
            if (k == -1) {
                break;
            }
            if (Math.abs(e[k]) <= tiny + eps*(Math.abs(s[k]) + Math.abs(s[k+1]))) {
                e[k] = 0.0;
                break;
            }
        }

        if (k == p-2) {
            kase = 4;
        } else {
            var ks;
            for (ks = p-1; ks >= k; ks--) {
                if (ks == k) {
                    break;
                }
                t = (ks != p ? Math.abs(e[ks]) : 0.0) + (ks != k+1 ? Math.abs(e[ks-1]) : 0.0);
                if (Math.abs(s[ks]) <= tiny + eps*t)  {
                    s[ks] = 0.0;
                    break;
                }
            }
            if (ks == k) {
                kase = 3;
            } else if (ks == p-1) {
                kase = 1;
            } else {
                kase = 2;
                k = ks;
            }
        }
        k++;

        // Perform the task indicated by kase.

        if(kase == 1) {
            // Deflate negligible s(p).
            f = e[p-2];
            e[p-2] = 0.0;
            for (j = p-2; j >= k; j--) {
                t = hypot(s[j],f);
                cs = s[j]/t;
                sn = f/t;
                s[j] = t;
                if (j != k) {
                    f = -sn*e[j-1];
                    e[j-1] = cs*e[j-1];
                }
                if (wantv) {
                    for (i = 0; i < n; i++) {
                        t = cs*V[i][j] + sn*V[i][p-1];
                        V[i][p-1] = -sn*V[i][j] + cs*V[i][p-1];
                        V[i][j] = t;
                    }
                }
            }
        } else if (kase == 2) {
            f = e[k-1];
            e[k-1] = 0.0;
            for (j = k; j < p; j++) {
                t = hypot(s[j],f);
                cs = s[j]/t;
                sn = f/t;
                s[j] = t;
                f = -sn*e[j];
                e[j] = cs*e[j];
                if (wantu) {
                    for (i = 0; i < m; i++) {
                        t = cs*U[i][j] + sn*U[i][k-1];
                        U[i][k-1] = -sn*U[i][j] + cs*U[i][k-1];
                        U[i][j] = t;
                    }
                }
            }
        } else if (kase == 3) {

            // Calculate the shift.

            var scale = Math.max(Math.max(Math.max(Math.max(
                Math.abs(s[p-1]),Math.abs(s[p-2])),Math.abs(e[p-2])),
                Math.abs(s[k])),Math.abs(e[k]));
            var sp = s[p-1]/scale;
            var spm1 = s[p-2]/scale;
            var epm1 = e[p-2]/scale;
            var sk = s[k]/scale;
            var ek = e[k]/scale;
            var b = ((spm1 + sp)*(spm1 - sp) + epm1*epm1)/2.0;
            var c = (sp*epm1)*(sp*epm1);
            var shift = 0.0;
            if ((b !== 0.0) || (c !== 0.0)) {
                shift = Math.sqrt(b*b + c);
                if (b < 0.0) {
                    shift = -shift;
                }
                shift = c/(b + shift);
            }
            f = (sk + sp)*(sk - sp) + shift;
            g = sk*ek;

            // Chase zeros.

            for (j = k; j < p-1; j++) {
                t = hypot(f,g);
                cs = f/t;
                sn = g/t;
                if (j != k) {
                    e[j-1] = t;
                }
                f = cs*s[j] + sn*e[j];
                e[j] = cs*e[j] - sn*s[j];
                g = sn*s[j+1];
                s[j+1] = cs*s[j+1];
                if (wantv) {
                    for (i = 0; i < n; i++) {
                        t = cs*V[i][j] + sn*V[i][j+1];
                        V[i][j+1] = -sn*V[i][j] + cs*V[i][j+1];
                        V[i][j] = t;
                    }
                }
                t = hypot(f,g);
                cs = f/t;
                sn = g/t;
                s[j] = t;
                f = cs*e[j] + sn*s[j+1];
                s[j+1] = -sn*e[j] + cs*s[j+1];
                g = sn*e[j+1];
                e[j+1] = cs*e[j+1];
                if (wantu && (j < m-1)) {
                    for (i = 0; i < m; i++) {
                        t = cs*U[i][j] + sn*U[i][j+1];
                        U[i][j+1] = -sn*U[i][j] + cs*U[i][j+1];
                        U[i][j] = t;
                    }
                }
            }
            e[p-2] = f;
            iter = iter + 1;
        } else if(kase == 4) {

            // Convergence.
            // Make the singular values positive.

            if (s[k] <= 0.0) {
                s[k] = (s[k] < 0.0 ? -s[k] : 0.0);
                if (wantv) {
                    for (i = 0; i <= pp; i++) {
                        V[i][k] = -V[i][k];
                    }
                }
            }

            // Order the singular values.

            while (k < pp) {
                if (s[k] >= s[k+1]) {
                    break;
                }
                t = s[k];
                s[k] = s[k+1];
                s[k+1] = t;
                if (wantv && (k < n-1)) {
                    for (i = 0; i < n; i++) {
                        t = V[i][k+1]; V[i][k+1] = V[i][k]; V[i][k] = t;
                    }
                }
                if (wantu && (k < m-1)) {
                    for (i = 0; i < m; i++) {
                        t = U[i][k+1]; U[i][k+1] = U[i][k]; U[i][k] = t;
                    }
                }
                k++;
            }
            totiter += iter;
            iter = 0;
            p--;
        }
    }
    if(lowrise) {
        return [V,s,U,totiter];
    } else {
        return [U,s,V,totiter];
    }
    /*
        Two norm: s[0] 
        Two norm condition number: s[0]/s[Math.min(m,n)-1]
        Rank:
            function rank (s) {
              var eps = 2.22E-16; // Math.pow(2.0,-52.0);
              tol = Math.max(m,n)*s[0]*eps;
              var r = 0;
              for (i = 0; i < s.length; i++) {
                 if (s[i] > tol) {
                    r++;
                 }
              }
              return r;
            }
        
    */
}
